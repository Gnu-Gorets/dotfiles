// agterm-pi-status-extension
//
// Pi lifecycle extension installed by agterm's Help ▸ Install Agent Status Hooks… command.
// It uses the installed agterm wrapper for session, pane, socket, and CLI resolution, so it is
// a harmless no-op outside agterm.

import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  const wrapper = join(homedir(), ".config", "agterm", "agent-status", "agterm-agent-status.sh");

  async function report(args: string[], message?: string): Promise<void> {
    const session = process.env.AGTERM_SESSION_ID;
    if (!session) return;
    try {
      await pi.exec(wrapper, args, { timeout: 1_000 });
    } catch {
      // Status reporting is advisory and must never interrupt Pi's agent loop.
    }
    if (!message) return;
    const notifyArgs = ["notify", message, "--title", "Pi", "--target", session];
    if (process.env.AGTERM_SOCKET) notifyArgs.push("--socket", process.env.AGTERM_SOCKET);
    try {
      await pi.exec("agtermctl", notifyArgs, { timeout: 1_000 });
    } catch {
      // Notification delivery is advisory and must never interrupt Pi's agent loop.
    }
  }

  pi.on("agent_start", async () => {
    await report(["active", "--blink"], "Pi started work.");
  });

  pi.on("ui_prompt_start", async () => {
    await report(["blocked", "--blink"], "Pi is waiting for your input.");
  });

  pi.on("ui_prompt_end", async () => {
    await report(["active", "--blink"]);
  });

  // `agent_settled` waits for automatic retries, compaction retries, and queued continuations.
  pi.on("agent_settled", async () => {
    await report(["completed", "--auto-reset"], "Pi finished.");
  });
}
