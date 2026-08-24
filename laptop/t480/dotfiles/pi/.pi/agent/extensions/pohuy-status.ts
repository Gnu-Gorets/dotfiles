import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { watch, type FSWatcher, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const SETTINGS_PATH = join(homedir(), ".pi", "agent", "settings.json");

function readTier(): string {
  try {
    const settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf8"));
    const tier = settings?.pohuy?.tier;
    return ["normal", "lite", "full", "ultra"].includes(tier) ? tier : "normal";
  } catch {
    return "normal";
  }
}

function setStatus(ctx: ExtensionContext): void {
  if (!ctx.ui.setStatus) return;
  const tier = readTier();
  const icon = tier === "normal" ? "○" : "💬";
  const indicator = tier === "normal" ? ctx.ui.theme.fg("dim", icon) : ctx.ui.theme.fg("accent", icon);
  ctx.ui.setStatus("pohuy", `${indicator} ${ctx.ui.theme.fg("muted", "pohuy: ")} ${ctx.ui.theme.fg("text", tier.toUpperCase())}`);
}

export default function pohuyStatusExtension(pi: ExtensionAPI): void {
  let watcher: FSWatcher | undefined;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  pi.on("session_start", (_event, ctx) => {
    setStatus(ctx);
    watcher?.close();
    watcher = watch(dirname(SETTINGS_PATH), (_eventType, filename) => {
      if (filename !== "settings.json") return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => setStatus(ctx), 50);
    });
  });

  pi.on("session_shutdown", () => {
    watcher?.close();
    watcher = undefined;
    clearTimeout(refreshTimer);
    refreshTimer = undefined;
  });
}
