/**
 * AegisNode Cache Utility
 *
 * Manages the local blocklist cache stored in:
 *   %LOCALAPPDATA%\AegisNode\cache.json
 *
 * The cache is refreshed from GitHub Raw URL once every 24 hours.
 * This provides offline-capable, zero-latency first-line defense.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCKLIST_URL =
  'https://raw.githubusercontent.com/your-username/aegisnode/main/blocklist.json';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheDir(): string {
  const localAppData =
    process.env['LOCALAPPDATA'] ||
    path.join(os.homedir(), 'AppData', 'Local');
  return path.join(localAppData, 'AegisNode');
}

function getCachePath(): string {
  return path.join(getCacheDir(), 'cache.json');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlocklistEntry {
  name: string;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BlocklistCache {
  known_malicious: BlocklistEntry[];
  last_updated: string;
  version: string;
  fetched_at: string;
}

// ─── Cache Read/Write ──────────────────────────────────────────────────────────

function ensureCacheDir(): void {
  const dir = getCacheDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readCache(): BlocklistCache | null {
  const cachePath = getCachePath();
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(raw) as BlocklistCache;
  } catch {
    return null;
  }
}

function writeCache(data: BlocklistCache): void {
  ensureCacheDir();
  const cachePath = getCachePath();
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
}

function isCacheStale(cache: BlocklistCache): boolean {
  if (!cache.fetched_at) return true;
  const fetchedAt = new Date(cache.fetched_at).getTime();
  const now = Date.now();
  return now - fetchedAt > CACHE_TTL_MS;
}

// ─── Fetch from GitHub ─────────────────────────────────────────────────────────

async function fetchBlocklistFromGitHub(): Promise<BlocklistCache | null> {
  try {
    const response = await fetch(BLOCKLIST_URL, {
      headers: { 'User-Agent': 'aegisnode-cli/1.0.0' },
      // @ts-ignore - timeout option valid in node-fetch v2
      timeout: 5000,
    });

    if (!response.ok) {
      process.stderr.write(
        `[AEGISNODE WARN]: Failed to fetch blocklist (HTTP ${response.status}). Using cached data.\n`
      );
      return null;
    }

    const data = (await response.json()) as Omit<BlocklistCache, 'fetched_at'>;
    return {
      ...data,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    process.stderr.write(
      `[AEGISNODE WARN]: Network error fetching blocklist. Using cached data.\n`
    );
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the blocklist, refreshing from GitHub if stale or missing.
 * Falls back to cached data if network is unavailable.
 */
export async function getBlocklist(): Promise<BlocklistEntry[]> {
  let cache = readCache();

  if (!cache || isCacheStale(cache)) {
    const fresh = await fetchBlocklistFromGitHub();
    if (fresh) {
      writeCache(fresh);
      cache = fresh;
    }
  }

  return cache?.known_malicious ?? [];
}

/**
 * Force-refresh the blocklist from GitHub regardless of TTL.
 */
export async function forceRefreshBlocklist(): Promise<{
  success: boolean;
  count: number;
  message: string;
}> {
  const fresh = await fetchBlocklistFromGitHub();
  if (!fresh) {
    return {
      success: false,
      count: 0,
      message: 'Failed to fetch blocklist from GitHub. Check your connection.',
    };
  }
  writeCache(fresh);
  return {
    success: true,
    count: fresh.known_malicious.length,
    message: `Blocklist updated: ${fresh.known_malicious.length} entries loaded.`,
  };
}

/**
 * Check if a package name appears in the blocklist.
 * Returns the matching entry or null if safe.
 */
export async function checkBlocklist(
  packageName: string
): Promise<BlocklistEntry | null> {
  const list = await getBlocklist();
  const normalized = packageName.toLowerCase().trim();
  return list.find((e) => e.name.toLowerCase() === normalized) ?? null;
}

/**
 * Get cache metadata for status display.
 */
export function getCacheStatus(): {
  exists: boolean;
  path: string;
  entryCount: number;
  fetchedAt: string | null;
  isStale: boolean;
} {
  const cachePath = getCachePath();
  const cache = readCache();

  if (!cache) {
    return {
      exists: false,
      path: cachePath,
      entryCount: 0,
      fetchedAt: null,
      isStale: true,
    };
  }

  return {
    exists: true,
    path: cachePath,
    entryCount: cache.known_malicious.length,
    fetchedAt: cache.fetched_at || null,
    isStale: isCacheStale(cache),
  };
}
