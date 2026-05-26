/**
 * AegisNode Heuristic Evaluator
 *
 * When a package passes the local blocklist check, this module
 * sends a request to the Netlify /api/verify endpoint which performs:
 *   1. npm registry existence check (404 → HALLUCINATED)
 *   2. Age + download count analysis (< 48h old AND < 100 downloads → SUSPICIOUS)
 *   3. Levenshtein distance against top npm packages (typosquat detection)
 */

import fetch from 'node-fetch';

// ─── Constants ────────────────────────────────────────────────────────────────

// Replace with your actual deployed Netlify domain before publishing
const NETLIFY_API_URL =
  'https://npm-aegisnode.netlify.app/api/verify';

const API_TIMEOUT_MS = 8000;

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerifyStatus = 'safe' | 'blocked';
export type BlockReason = 'HALLUCINATED' | 'SUSPICIOUS' | 'TYPOSQUAT' | 'MALICIOUS';

export interface VerifyResult {
  status: VerifyStatus;
  reason: BlockReason | string;
  details?: string;
  source: 'api' | 'offline';
}

// ─── API Call ─────────────────────────────────────────────────────────────────

/**
 * Query the Netlify heuristic API for a package verdict.
 * Falls back to 'safe' if the API is unreachable (to avoid blocking legitimate work).
 */
export async function queryHeuristicApi(
  packageName: string
): Promise<VerifyResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch(NETLIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aegisnode-cli/1.0.0',
      },
      body: JSON.stringify({ package: packageName }),
      signal: controller.signal as never,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If API is down, fail open (allow install) to avoid disrupting legitimate work
      return {
        status: 'safe',
        reason: `API unavailable (HTTP ${response.status}) - defaulting to allow`,
        source: 'offline',
      };
    }

    const data = (await response.json()) as VerifyResult;
    return { ...data, source: 'api' };
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error && err.name === 'AbortError';
    return {
      status: 'safe',
      reason: isAbort
        ? 'API timeout - defaulting to allow'
        : 'Network error - defaulting to allow',
      source: 'offline',
    };
  }
}
