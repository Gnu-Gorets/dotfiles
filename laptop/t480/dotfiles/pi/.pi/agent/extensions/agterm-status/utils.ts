export type ExecResult = { stdout: string; stderr: string; code: number };
export type Exec = (command: string, args: string[], options: { cwd: string; timeout: number }) => Promise<ExecResult>;

type PullRequest = { number: number; state: string; isDraft: boolean; reviewDecision: string | null };
const STATUS_ARGS = ["--no-optional-locks", "status", "--porcelain=v2", "--branch", "--untracked-files=all"];

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

export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}\[\]()<>#+!|~^&.-]/g, (char) => `\\${char}`);
}

export async function getGitStatus(exec: Exec, cwd: string): Promise<string | undefined> {
  const result = await exec("git", STATUS_ARGS, { cwd, timeout: 1_000 });
  if (result.code !== 0) return undefined;

  const lines = result.stdout.split("\n");
  const header = (name: string) => {
    const prefix = `# branch.${name} `;
    return lines.find((line) => line.startsWith(prefix))?.slice(prefix.length);
  };
  const head = header("head");
  if (!head) return undefined;

  const upstream = header("upstream");
  const oid = header("oid")?.slice(0, 7) ?? "unknown";
  const branch = head === "(detached)" ? oid : head;
  const name = escapeMarkdown(shortenBranch(branch));
  const line = head === "(detached)"
    ? `📍 **${name}** ^[detached](dim: true)`
    : `${upstream ? "🌿" : "🌱"} **${name}**`;

  const changes = lines.filter((entry) => /^(?:1|2|u|\?) /.test(entry)).length;
  const worktree = changes
    ? `^[● ${changes}](color: "orange")`
    : `^[✓ clean](color: "green")`;
  let status = `${line} ${worktree}`;

  const divergence = header("ab")?.match(/^\+(\d+) -(\d+)$/);
  const ahead = Number(divergence?.[1] ?? 0);
  const behind = Number(divergence?.[2] ?? 0);
  if (ahead) status += ` ^[↑${ahead}](color: "blue")`;
  if (behind) status += ` ^[↓${behind}](color: "purple")`;
  if (!upstream && head !== "(detached)") status += " ^[local only](dim: true)";

  if (head !== "(detached)") {
    try {
      const prResult = await exec("gh", ["pr", "view", "--json", "number,state,isDraft,reviewDecision"], { cwd, timeout: 2_000 });
      if (prResult.code === 0) {
        const pr = JSON.parse(prResult.stdout) as PullRequest;
        if (pr.state === "OPEN") {
          const review = {
            APPROVED: "approved",
            CHANGES_REQUESTED: "changes requested",
            REVIEW_REQUIRED: "review needed",
          }[pr.reviewDecision ?? ""];
          status += ` · PR #${pr.number}${pr.isDraft ? " draft" : ""}${review ? ` ${review}` : ""}`;
        }
      }
    } catch {
      // PR details are optional; keep the verified local Git status.
    }
  }

  return status;
}
