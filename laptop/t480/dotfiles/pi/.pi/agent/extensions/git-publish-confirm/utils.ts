export function isProtectedCommand(command: string): boolean {
  return /\bgit\b[^;&|\n]*\bcommit\b/.test(command) || /\bgh\s+pr\s+create\b/.test(command);
}

export function parseMessage(message: string): { title: string; description: string } | undefined {
  const [firstLine = "", ...rest] = message.trim().split(/\r?\n/);
  const title = firstLine.trim();
  if (!title) return undefined;
  return { title, description: rest.join("\n").trim() };
}

export type AgtermAskResult =
  | { status: "submitted"; text: string }
  | { status: "cancelled" | "unavailable" | "invalid" };

export function parseAgtermAskResult(stdout: string, code: number): AgtermAskResult {
  if (code === 2 || code === 3) return { status: "cancelled" };
  if (code !== 0) return { status: "unavailable" };

  try {
    const answer: unknown = JSON.parse(stdout);
    if (
      typeof answer === "object" &&
      answer !== null &&
      "result" in answer &&
      answer.result === "answered" &&
      "id" in answer &&
      answer.id === "submit" &&
      "text" in answer &&
      typeof answer.text === "string"
    ) {
      return { status: "submitted", text: answer.text };
    }
  } catch {
    return { status: "invalid" };
  }

  return { status: "invalid" };
}
