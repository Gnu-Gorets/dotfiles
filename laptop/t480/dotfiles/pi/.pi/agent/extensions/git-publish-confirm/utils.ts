export type Exec = (
  command: string,
  args: string[],
  options: { cwd: string; signal?: AbortSignal },
) => Promise<{ stdout: string; stderr: string; code: number }>;

export async function pushAndCreatePullRequest(exec: Exec, cwd: string, title: string, body: string) {
  const branch = await exec("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd });
  const branchName = branch.stdout.trim();
  if (branch.code !== 0 || !branchName) {
    const output = [branch.stdout, branch.stderr].filter(Boolean).join("\n").trim();
    return { ...branch, code: branch.code || 1, command: "git symbolic-ref", output: output || "Cannot create a pull request from detached HEAD." };
  }

  const remote = await exec("git", ["remote", "get-url", "origin"], { cwd });
  const remoteUrl = remote.stdout.trim();
  const scpPath = remoteUrl.match(/^[^@]+@[^:]+:(.+)$/)?.[1];
  let remotePath = scpPath;
  if (!remotePath) {
    try {
      remotePath = new URL(remoteUrl).pathname;
    } catch {
      remotePath = "";
    }
  }
  const remoteParts = remotePath.replace(/^\/+/, "").replace(/\.git$/, "").split("/");
  const headOwner = remoteParts.length === 2 && remoteParts.every(Boolean) ? remoteParts[0] : "";
  if (remote.code !== 0 || !headOwner) {
    const output = [remote.stdout, remote.stderr].filter(Boolean).join("\n").trim();
    return { ...remote, code: remote.code || 1, command: "git remote get-url origin", output: output || "Cannot determine GitHub owner for origin." };
  }

  const branchRef = `refs/heads/${branchName}`;
  const push = await exec("git", ["push", "--set-upstream", "origin", `${branchRef}:${branchRef}`], { cwd });
  const pushOutput = [push.stdout, push.stderr].filter(Boolean).join("\n").trim();
  if (push.code !== 0) return { ...push, command: "git push", output: pushOutput };

  const result = await exec("gh", ["pr", "create", "--head", `${headOwner}:${branchName}`, "--title", title, "--body", body], { cwd });
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
