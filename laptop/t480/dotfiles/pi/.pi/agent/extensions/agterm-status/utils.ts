export type ExecResult = { stdout: string; stderr: string; code: number };
export type Exec = (command: string, args: string[], options: { cwd: string; timeout: number }) => Promise<ExecResult>;

type PullRequest = { number: number; state: string; isDraft: boolean; reviewDecision: string | null };

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
  let status = `${leaf} ${branch} · ${changes ? `${changes} changed` : "✓ clean"}`;
  if (ahead) status += ` ↑${ahead}`;
  if (behind) status += ` ↓${behind}`;

  try {
    const result = await exec("gh", ["pr", "view", "--json", "number,state,isDraft,reviewDecision"], { cwd, timeout: 2_000 });
    if (result.code === 0) {
      const pr = JSON.parse(result.stdout) as PullRequest;
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
