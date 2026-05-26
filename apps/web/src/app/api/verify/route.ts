import { NextRequest, NextResponse } from 'next/server';
import levenshtein from 'fast-levenshtein';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifyRequest {
  package: string;
}

interface VerifyResponse {
  status: 'safe' | 'blocked';
  reason: string;
  details?: string;
}

interface NpmPackageData {
  name?: string;
  time?: {
    created?: string;
    modified?: string;
    [version: string]: string | undefined;
  };
  'dist-tags'?: {
    latest?: string;
    [tag: string]: string | undefined;
  };
  versions?: Record<string, unknown>;
  description?: string;
}

interface NpmDownloadData {
  downloads?: number;
  package?: string;
  start?: string;
  end?: string;
}

// ─── Top 1000 npm Packages (Levenshtein Check) ───────────────────────────────
// A representative sample of the top npm packages used for typosquat detection

const TOP_NPM_PACKAGES = [
  'react', 'react-dom', 'express', 'lodash', 'chalk', 'axios', 'moment',
  'typescript', 'webpack', 'babel-core', 'eslint', 'prettier', 'jest',
  'mocha', 'nodemon', 'dotenv', 'cors', 'body-parser', 'mongoose',
  'sequelize', 'knex', 'pg', 'mysql2', 'redis', 'ioredis', 'socket.io',
  'next', 'vue', 'angular', 'svelte', 'nuxt', 'gatsby', 'remix',
  'vite', 'rollup', 'parcel', 'esbuild', 'turbo', 'nx', 'lerna',
  'commander', 'yargs', 'minimist', 'inquirer', 'ora', 'boxen',
  'fs-extra', 'glob', 'rimraf', 'mkdirp', 'chokidar', 'node-fetch',
  'cross-env', 'concurrently', 'husky', 'lint-staged', 'semantic-release',
  'uuid', 'nanoid', 'cuid', 'shortid', 'hashids', 'bcrypt', 'jsonwebtoken',
  'passport', 'express-session', 'cookie-parser', 'helmet', 'morgan',
  'winston', 'pino', 'debug', 'colors', 'ansi-styles', 'strip-ansi',
  'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'less', 'stylus',
  'classnames', 'clsx', 'styled-components', 'emotion', 'radix-ui',
  'formik', 'react-hook-form', 'yup', 'zod', 'joi', 'ajv',
  'date-fns', 'luxon', 'dayjs', 'numeral', 'accounting',
  'lodash-es', 'ramda', 'immutable', 'immer', 'zustand', 'redux',
  'rxjs', 'graphql', 'apollo-client', 'prisma', 'typeorm',
  'jest-dom', 'testing-library', 'cypress', 'playwright', 'puppeteer',
  'aws-sdk', 'azure', 'firebase', 'supabase', 'netlify',
  'stripe', 'twilio', 'sendgrid', 'nodemailer', 'mailgun',
  'sharp', 'jimp', 'canvas', 'pdfkit', 'puppeteer-pdf',
  'multer', 'busboy', 'formidable', 'archiver', 'unzipper',
  'cheerio', 'jsdom', 'playwright', 'selenium-webdriver',
  'socket.io-client', 'ws', 'mqtt', 'amqplib', 'kafka-node',
  'bull', 'agenda', 'node-cron', 'later', 'cron',
  'compression', 'hpp', 'express-rate-limit', 'express-validator',
  'serialize-error', 'p-limit', 'p-queue', 'bottleneck', 'async',
  'through2', 'pump', 'mississippi', 'bl', 'readable-stream',
  'semver', 'validate-npm-package-name', 'npm-check-updates',
  'cosmiconfig', 'rc', 'conf', 'envfile', 'dotenv-expand',
];

// ─── Validation ───────────────────────────────────────────────────────────────

const NPM_PACKAGE_NAME_REGEX = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function validatePackageName(name: string): boolean {
  if (!name || name.length === 0 || name.length > 214) return false;
  return NPM_PACKAGE_NAME_REGEX.test(name);
}

// ─── npm Registry Fetch ───────────────────────────────────────────────────────

async function fetchNpmPackage(packageName: string): Promise<{
  exists: boolean;
  data: NpmPackageData | null;
  statusCode: number;
}> {
  const encodedName = encodeURIComponent(packageName).replace('%40', '@');
  const url = `https://registry.npmjs.org/${encodedName}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'aegisnode-verify/1.0.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 404) {
      return { exists: false, data: null, statusCode: 404 };
    }

    if (!response.ok) {
      return { exists: false, data: null, statusCode: response.status };
    }

    const data = (await response.json()) as NpmPackageData;
    return { exists: true, data, statusCode: 200 };
  } catch {
    return { exists: false, data: null, statusCode: 0 };
  }
}

// ─── npm Download Count Fetch ─────────────────────────────────────────────────

async function fetchDownloadCount(packageName: string): Promise<number> {
  const encodedName = encodeURIComponent(packageName).replace('%40', '@');
  // Last 7 days to have a reasonable sample
  const url = `https://api.npmjs.org/downloads/point/last-week/${encodedName}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'aegisnode-verify/1.0.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return 0;

    const data = (await response.json()) as NpmDownloadData;
    return data.downloads ?? 0;
  } catch {
    return 0;
  }
}

// ─── Heuristic Checks ─────────────────────────────────────────────────────────

/**
 * Check if a package was published less than 48 hours ago.
 */
function isRecentlyPublished(npmData: NpmPackageData): boolean {
  const createdStr = npmData.time?.created;
  if (!createdStr) return false;

  const createdAt = new Date(createdStr).getTime();
  const nowMs = Date.now();
  const ageMs = nowMs - createdAt;
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  return ageMs < fortyEightHoursMs;
}

/**
 * Check Levenshtein distance against top npm packages.
 * Returns the closest package name if suspiciously close (dist ≤ 2).
 */
function findTyposquatCandidate(
  packageName: string
): { candidate: string; distance: number } | null {
  const TYPOSQUAT_THRESHOLD = 2;
  const name = packageName.toLowerCase();

  // Don't flag if it IS one of the top packages
  if (TOP_NPM_PACKAGES.includes(name)) return null;

  let closest: { candidate: string; distance: number } | null = null;

  for (const topPkg of TOP_NPM_PACKAGES) {
    // Skip obviously different-length packages
    if (Math.abs(name.length - topPkg.length) > TYPOSQUAT_THRESHOLD) continue;

    const dist = levenshtein.get(name, topPkg);
    if (dist > 0 && dist <= TYPOSQUAT_THRESHOLD) {
      if (!closest || dist < closest.distance) {
        closest = { candidate: topPkg, distance: dist };
      }
    }
  }

  return closest;
}

// ─── API Route Handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  // Parse request body
  let body: VerifyRequest;
  try {
    body = (await request.json()) as VerifyRequest;
  } catch {
    return NextResponse.json(
      { status: 'blocked', reason: 'INVALID_REQUEST', details: 'Request body must be valid JSON with a "package" field.' },
      { status: 400 }
    );
  }

  const packageName = (body.package ?? '').trim().toLowerCase();

  // Validate package name
  if (!packageName) {
    return NextResponse.json(
      { status: 'blocked', reason: 'INVALID_REQUEST', details: 'Package name is required.' },
      { status: 400 }
    );
  }

  if (!validatePackageName(packageName)) {
    return NextResponse.json(
      { status: 'blocked', reason: 'INVALID_PACKAGE_NAME', details: `"${packageName}" is not a valid npm package name.` },
      { status: 400 }
    );
  }

  // ── Step 1: Check npm registry existence ──────────────────────────────────
  const { exists, data: npmData, statusCode } = await fetchNpmPackage(packageName);

  if (!exists && statusCode === 404) {
    return NextResponse.json({
      status: 'blocked',
      reason: 'HALLUCINATED',
      details: `Package "${packageName}" does not exist on the npm registry. It may be a hallucinated package name.`,
    });
  }

  // If registry is unreachable (network error), default to safe (fail open)
  if (!exists && statusCode === 0) {
    return NextResponse.json({
      status: 'safe',
      reason: 'REGISTRY_UNAVAILABLE',
      details: 'npm registry is unreachable. Defaulting to safe.',
    });
  }

  // ── Step 2: Typosquat detection (before we fetch download counts) ─────────
  const typosquat = findTyposquatCandidate(packageName);
  if (typosquat) {
    return NextResponse.json({
      status: 'blocked',
      reason: `TYPOSQUAT - Levenshtein distance ${typosquat.distance} from "${typosquat.candidate}". Possible impersonation.`,
      details: `The package "${packageName}" is suspiciously similar to the popular package "${typosquat.candidate}" (edit distance: ${typosquat.distance}). This is a common typosquat attack pattern.`,
    });
  }

  // ── Step 3: Age + download count heuristic ────────────────────────────────
  if (npmData && isRecentlyPublished(npmData)) {
    const downloads = await fetchDownloadCount(packageName);

    if (downloads < 100) {
      return NextResponse.json({
        status: 'blocked',
        reason: `SUSPICIOUS - Published less than 48 hours ago with ${downloads} downloads. High risk of malicious payload.`,
        details: `Package "${packageName}" was recently published (< 48h) and has very few downloads (${downloads}). This pattern is common with supply chain attack packages.`,
      });
    }
  }

  // ── All checks passed ──────────────────────────────────────────────────────
  return NextResponse.json({
    status: 'safe',
    reason: 'passed_all_checks',
    details: `Package "${packageName}" exists on npm, is not a known typosquat, and does not exhibit suspicious freshness patterns.`,
  });
}

// Only allow POST
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with { "package": "package-name" }.' },
    { status: 405 }
  );
}
