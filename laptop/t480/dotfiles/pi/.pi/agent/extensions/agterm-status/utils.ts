export type ExecResult = { stdout: string; stderr: string; code: number };
export type Exec = (command: string, args: string[], options: { cwd: string; timeout: number }) => Promise<ExecResult>;

type PullRequest = { number: number; state: string; isDraft: boolean; reviewDecision: string | null };

export function shortenBranch(branch: string, maxLength = 18): string {
  const chars = Array.from(branch);
  if (chars.length <= maxLength) return branch;

  const slash = chars.indexOf("/");
  if (slash >= 0 && slash < Math.floor(maxLength / 2)) {
    const prefix = chars.slice(0, slash + 1);
    const suffixLength = maxLength - prefix.length - 1;
    return `${prefix.join("")}…${chars.slice(-suffixLength).join("")}`;
  }

  const prefixLength = Math.ceil((maxLength - 1) / 2);
  const suffixLength = maxLength - prefixLength - 1;
  return `${chars.slice(0, prefixLength).join("")}…${chars.slice(-suffixLength).join("")}`;
}

export async function getGitStatus(exec: Exec, cwd: string): Promise<string | undefined> {
  const root = await exec("git", ["rev-parse", "--show-toplevel"], { cwd, timeout: 1_000 });
  if (root.code !== 0) return undefined;

  const [branchResult, statusResult, defaultBranchResult] = await Promise.all([
    exec("git", ["branch", "--show-current"], { cwd, timeout: 1_000 }),
    exec("git", ["status", "--short", "--branch", "--ahead-behind"], { cwd, timeout: 1_000 }),
    exec("git", ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], { cwd, timeout: 1_000 }),
  ]);
  if (branchResult.code !== 0 || statusResult.code !== 0) return undefined;

  const branch = branchResult.stdout.trim() || `detached @${(await exec("git", ["rev-parse", "--short", "HEAD"], { cwd, timeout: 1_000 })).stdout.trim()}`;
  let defaultBranch = defaultBranchResult.code === 0
    ? defaultBranchResult.stdout.trim().replace(/^origin\//, "")
    : "";
  if (!defaultBranch) {
    try {
      const result = await exec("gh", ["repo", "view", "--json", "defaultBranchRef", "--jq", ".defaultBranchRef.name"], { cwd, timeout: 2_000 });
      if (result.code === 0) defaultBranch = result.stdout.trim();
    } catch {
      // Use the Git remote's default branch when GitHub metadata is unavailable.
    }
  }
  const lines = statusResult.stdout.trimEnd().split("\n");
  const changes = lines.filter((line) => line && !line.startsWith("## ")).length;
  const tracking = lines.find((line) => line.startsWith("## ")) ?? "";
  const ahead = tracking.match(/\[ahead (\d+)/)?.[1];
  const behind = tracking.match(/behind (\d+)/)?.[1];
  const leaf = branch === defaultBranch ? "🌿" : "🌱";
  const worktree = changes
    ? `^[● ${changes}](color: "orange")`
    : `^[✓ clean](color: "green")`;
  let status = `${leaf} ${shortenBranch(branch)} · ${worktree}`;
  if (ahead) status += ` ↑${ahead}`;
  if (behind) status += ` ↓${behind}`;

  try {
    const result = await exec("gh", ["pr", "view", "--json", "number,state,isDraft,reviewDecision"], { cwd, timeout: 2_000 });
    if (result.code === 0) {
      const pr = JSON.parse(result.stdout) as PullRequest;
      if (pr.state !== "OPEN") return status;
      const review = {
        APPROVED: "approved",
        CHANGES_REQUESTED: "changes requested",
        REVIEW_REQUIRED: "review needed",
      }[pr.reviewDecision ?? ""];
      status += ` · PR #${pr.number}${pr.isDraft ? " draft" : ""}${review ? ` ${review}` : ` ${pr.state.toLowerCase()}`}`;
    }
  } catch {
    // PR details are optional; keep the verified local Git status.
  }

  return status;
}
