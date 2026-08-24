import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readFileSync, watch, type FSWatcher } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const AUTH_PATH = join(homedir(), ".pi", "agent", "auth.json");
const USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const REFRESH_MS = 5 * 60_000;

type Window = { used_percent?: number; reset_at?: number; limit_window_seconds?: number };

type Usage = {
	rate_limit?: { primary_window?: Window | null; secondary_window?: Window | null };
};

function readAuth(): { access: string; accountId?: string } | undefined {
  try {
    const auth = JSON.parse(readFileSync(AUTH_PATH, "utf8"))["openai-codex"];
    return auth?.access ? { access: auth.access, accountId: auth.accountId } : undefined;
  } catch {
    return undefined;
  }
}

function duration(seconds = 0): string {
  if (seconds <= 6 * 3600) return "5h";
  if (seconds <= 8 * 86400) return "1w";
  return `${Math.round(seconds / 3600)}h`;
}

function countdown(resetAt?: number): string {
  if (!resetAt) return "";
  const minutes = Math.max(0, Math.ceil((resetAt - Date.now() / 1000) / 60));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  return days ? `↻${days}d ${hours}h ${rest}m` : hours ? `↻${hours}h ${rest}m` : `↻${rest}m`;
}

async function readUsage(): Promise<string> {
  const auth = readAuth();
  if (!auth) return "codex: —";
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${auth.access}`,
      "User-Agent": "pi-codex-limits/1.0",
    };
    if (auth.accountId) headers["ChatGPT-Account-ID"] = auth.accountId;
    const response = await fetch(USAGE_URL, { headers });
    if (!response.ok) return "codex: ?";
    const usage = (await response.json()) as Usage;
    const windows = [usage.rate_limit?.primary_window, usage.rate_limit?.secondary_window]
      .filter((window): window is Window => Boolean(window))
      .sort((a, b) => (a.limit_window_seconds ?? 0) - (b.limit_window_seconds ?? 0));
    if (!windows.length) return "codex: —";
    return `codex: ${windows
      .map((window) => `${duration(window.limit_window_seconds)} ${Math.max(0, 100 - (window.used_percent ?? 0))}%${countdown(window.reset_at)}`)
      .join(" · ")}`;
  } catch {
    return "codex: ?";
  }
}

export default function codexLimitsExtension(pi: ExtensionAPI): void {
  let timer: ReturnType<typeof setInterval> | undefined;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let watcher: FSWatcher | undefined;
  let currentCtx: ExtensionContext | undefined;

  const refresh = async (): Promise<void> => {
    if (!currentCtx?.ui.setStatus) return;
    currentCtx.ui.setStatus("codex-limits", currentCtx.ui.theme.fg("muted", await readUsage()));
  };

  pi.on("session_start", (_event, ctx) => {
    currentCtx = ctx;
    void refresh();
    timer = setInterval(() => void refresh(), REFRESH_MS);
    watcher = watch(AUTH_PATH, () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => void refresh(), 100);
    });
  });

  pi.on("session_shutdown", () => {
    if (timer) clearInterval(timer);
    if (watcher) watcher.close();
    clearTimeout(refreshTimer);
    timer = undefined;
    watcher = undefined;
    currentCtx = undefined;
  });
}
