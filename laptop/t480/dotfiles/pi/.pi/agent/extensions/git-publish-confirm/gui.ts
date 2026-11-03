import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export type ReviewResult = { status: "submitted"; text: string } | { status: "cancelled" };

export function parseReviewResult(stdout: string, code: number | null): ReviewResult {
  if (code !== 0) throw new Error("Publish editor exited without confirmation.");
  const result: unknown = JSON.parse(stdout);
  if (typeof result === "object" && result !== null && "status" in result) {
    if (result.status === "cancelled") return { status: "cancelled" };
    if (result.status === "submitted" && "text" in result && typeof result.text === "string") {
      return { status: "submitted", text: result.text };
    }
  }
  throw new Error("Invalid publish editor response.");
}

export function openPublishDialog(title: string, text: string, signal?: AbortSignal, spawnProcess: typeof spawn = spawn): Promise<ReviewResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return resolve({ status: "cancelled" });
    const child = spawnProcess("/usr/bin/python3", ["-B", fileURLToPath(new URL("./gui.py", import.meta.url))], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let failure: Error | undefined;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    const terminate = () => {
      child.kill("SIGTERM");
      killTimer ??= setTimeout(() => child.kill("SIGKILL"), 1000);
      killTimer.unref();
    };
    signal?.addEventListener("abort", terminate, { once: true });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      if (failure) return;
      stdout += chunk;
      if (Buffer.byteLength(stdout) > 1024 * 1024) {
        failure = new Error("Publish editor response too large.");
        terminate();
      }
    });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk.toString()).slice(-8192); });
    child.stdin.on("error", (error) => { failure = error; });
    child.on("error", (error) => { failure = error; });
    child.on("close", (code) => {
      signal?.removeEventListener("abort", terminate);
      if (killTimer) clearTimeout(killTimer);
      if (signal?.aborted) return resolve({ status: "cancelled" });
      if (failure) return reject(failure);
      try {
        resolve(parseReviewResult(stdout, code));
      } catch (error) {
        reject(new Error(`${(error as Error).message}${stderr ? `\n${stderr.trim()}` : ""}`));
      }
    });
    child.stdin.end(JSON.stringify({ title, text }));
    if (signal?.aborted) terminate();
  });
}
