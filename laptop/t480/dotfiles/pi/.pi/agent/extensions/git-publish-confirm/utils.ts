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

  const origin = await exec("git", ["remote", "get-url", "--push", "origin"], { cwd });
  const originUrl = origin.stdout.trim();
  if (origin.code !== 0 || !originUrl) {
    return { ...origin, code: origin.code || 1, command: "git remote get-url", output: "Cannot determine the origin push URL. Nothing was pushed." };
  }

  const repository = await exec("gh", ["repo", "view", originUrl, "--json", "url", "--jq", ".url"], { cwd });
  const repositoryUrl = repository.stdout.trim();
  if (repository.code !== 0 || !repositoryUrl) {
    const output = [repository.stdout, repository.stderr].filter(Boolean).join("\n").trim();
    return { ...repository, code: repository.code || 1, command: "gh repo view", output: `Cannot resolve the origin GitHub repository. Nothing was pushed.${output ? `\n${output}` : ""}` };
  }

  const branchRef = `refs/heads/${branchName}`;
  const push = await exec("git", ["push", "--set-upstream", "origin", `${branchRef}:${branchRef}`], { cwd });
  const pushOutput = [push.stdout, push.stderr].filter(Boolean).join("\n").trim();
  if (push.code !== 0) return { ...push, command: "git push", output: pushOutput };

  const result = await exec("gh", ["pr", "create", "--repo", repositoryUrl, "--head", branchName, "--title", title, "--body", body], { cwd });
  return {
    ...result,
    command: "gh pr create",
    output: [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
  };
}

export function isProtectedCommand(command: string): boolean {
  return /\bgit\b[^;&|\n]*\bcommit\b/.test(command) || /\bgh\s+pr\s+create\b/.test(command);
}

const validStatusChars = new Set([" ", "M", "T", "A", "D", "R", "C", "U", "?"]);
const unmergedStatuses = new Set(["DD", "AU", "UD", "UA", "DU", "AA", "UU"]);

export function parseWorktreePaths(status: string): string[] {
  const fields = status.split("\0");
  if (fields.at(-1) === "") fields.pop();

  const paths: string[] = [];
  for (let i = 0; i < fields.length; i++) {
    const entry = fields[i];
    if (entry.length < 4 || entry[2] !== " ") throw new Error("Unexpected git status output.");
    const state = entry.slice(0, 2);
    if ([...state].some((character) => !validStatusChars.has(character))) throw new Error("Unexpected git status code.");
    if (unmergedStatuses.has(state)) throw new Error("Resolve unmerged paths before publishing.");
    const path = entry.slice(3);
    if (!path) throw new Error("Unexpected empty path in git status output.");
    paths.push(path);

    if (state.includes("R") || state.includes("C")) {
      const source = fields[++i];
      if (source === undefined || source === "") throw new Error("Missing source path in git rename status.");
      paths.push(source);
    }
  }
  return [...new Set(paths)];
}

export function parseMessage(message: string): { title: string; description: string } | undefined {
  const [firstLine = "", ...rest] = message.trim().split(/\r?\n/);
  const title = firstLine.trim();
  if (!title) return undefined;
  return { title, description: rest.join("\n").trim() };
}
