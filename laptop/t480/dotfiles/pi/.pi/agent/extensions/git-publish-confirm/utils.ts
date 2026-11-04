export type Exec = (
  command: string,
  args: string[],
  options: { cwd: string; signal?: AbortSignal },
) => Promise<{ stdout: string; stderr: string; code: number }>;

export async function pushAndCreatePullRequest(exec: Exec, cwd: string, title: string, body: string) {
  const push = await exec("git", ["push", "--set-upstream", "origin", "HEAD"], { cwd });
  const pushOutput = [push.stdout, push.stderr].filter(Boolean).join("\n").trim();
  if (push.code !== 0) return { ...push, command: "git push", output: pushOutput };

  const result = await exec("gh", ["pr", "create", "--title", title, "--body", body], { cwd });
  return {
    ...result,
    command: "gh pr create",
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
  };
}

export function isProtectedCommand(command: string): boolean {
  return /\bgit\b[^;&|\n]*\bcommit\b/.test(command) || /\bgh\s+pr\s+create\b/.test(command);
}

export function parseMessage(message: string): { title: string; description: string } | undefined {
  const [firstLine = "", ...rest] = message.trim().split(/\r?\n/);
  const title = firstLine.trim();
  if (!title) return undefined;
  return { title, description: rest.join("\n").trim() };
}
