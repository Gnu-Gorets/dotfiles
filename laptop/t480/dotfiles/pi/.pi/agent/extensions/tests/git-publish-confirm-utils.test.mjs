import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { isProtectedCommand, parseMessage, parseWorktreePaths } from "../git-publish-confirm/utils.ts";
import { parseReviewResult } from "../git-publish-confirm/gui.ts";
import { reviewAndPublish } from "../git-publish-confirm/publish.ts";

const proposal = { action: "commit", title: "fix: original", description: "Original body" };
const submitted = async () => ({ status: "submitted", text: "feat: edited\n\nEdited body ✓" });
const ok = { code: 0, stdout: "done", stderr: "" };
const execFileAsync = promisify(execFile);

test("protects commit and GitHub PR commands", () => {
  assert.equal(isProtectedCommand("git commit -m 'title'"), true);
  assert.equal(isProtectedCommand("git -C /repo commit --file message"), true);
  assert.equal(isProtectedCommand("gh pr create --title title"), true);
  assert.equal(isProtectedCommand("git status && gh pr create"), true);
  assert.equal(isProtectedCommand("git status && gh pr list"), false);
});

test("splits reviewed message into title and description", () => {
  assert.deepEqual(parseMessage("  feat: add login\n\nDescription\n"), {
    title: "feat: add login", description: "Description",
  });
  assert.equal(parseMessage(" \n "), undefined);
});

test("parses NUL-delimited worktree paths without losing whitespace or rename sources", () => {
  assert.deepEqual(parseWorktreePaths(" M tracked file\0?? new\nfile\0"), ["tracked file", "new\nfile"]);
  assert.deepEqual(parseWorktreePaths("R  renamed\0original\0"), ["renamed", "original"]);
  assert.deepEqual(parseWorktreePaths(""), []);
  assert.throws(() => parseWorktreePaths("UU conflicted\0"), /Resolve unmerged paths/);
  assert.throws(() => parseWorktreePaths("bad"), /Unexpected git status/);
  assert.throws(() => parseWorktreePaths("!! ignored\0"), /Unexpected git status code/);
});

test("requires successful exit and explicit valid review response", () => {
  assert.deepEqual(parseReviewResult('{"status":"submitted","text":"text ✓"}', 0), { status: "submitted", text: "text ✓" });
  assert.deepEqual(parseReviewResult('{"status":"cancelled"}', 0), { status: "cancelled" });
  for (const text of ["", "broken", "null", "[]", '{"status":"submitted"}', '{"status":"submitted","text":true}', '{"status":"answered","text":"x"}']) {
    assert.throws(() => parseReviewResult(text, 0));
  }
  for (const code of [null, 1, 2, 3]) {
    assert.throws(() => parseReviewResult('{"status":"submitted","text":"x"}', code));
  }
});

for (const action of ["commit", "pr"]) {
  for (const [name, review] of [
    ["cancel", async () => ({ status: "cancelled" })],
    ["empty title", async () => ({ status: "submitted", text: " \n " })],
    ["GUI crash", async () => { throw new Error("crash"); }],
  ]) {
    test(`${action}: ${name} never publishes`, async () => {
      let calls = 0;
      await reviewAndPublish({ ...proposal, action }, "/test", undefined, async (_command, args) => {
        calls++;
        if (action === "commit" && args[0] === "diff" && args[2] === "--quiet") return { ...ok, code: 1 };
        return ok;
      }, review);
      assert.equal(calls, action === "commit" ? 2 : 0);
    });
  }
}

test("already aborted operation never opens editor", async () => {
  const controller = new AbortController();
  controller.abort();
  await reviewAndPublish(proposal, "/test", controller.signal, async () => assert.fail("exec"), async () => assert.fail("review"));
});

test("abort during review ignores even submitted answer", async () => {
  const controller = new AbortController();
  await reviewAndPublish(proposal, "/test", controller.signal, async (_command, args) => {
    if (args[0] === "diff" && args[2] === "--quiet") return { ...ok, code: 1 };
    if (args[0] === "diff" && args[2] === "--check") return ok;
    assert.fail("exec");
  }, async () => {
    controller.abort();
    return submitted();
  });
});

test("clean repository stops before review", async () => {
  const calls = [];
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    calls.push(args);
    return args[0] === "status" ? { ...ok, stdout: "" } : ok;
  }, async () => assert.fail("review should not open"));
  assert.deepEqual(calls, [["diff", "--cached", "--quiet"], ["status", "--porcelain=v1", "-z", "--untracked-files=all"]]);
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /No changes to commit/);
});

test("cancelling the staging prompt leaves the worktree untouched", async () => {
  const calls = [];
  let shownPaths;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    calls.push(args);
    if (args[0] === "status") return { ...ok, stdout: " M tracked file\0?? new file\0" };
    return ok;
  }, async () => assert.fail("review should not open"), async (paths) => {
    shownPaths = paths;
    return false;
  });
  assert.deepEqual(shownPaths, ["tracked file", "new file"]);
  assert.deepEqual(calls, [["diff", "--cached", "--quiet"], ["status", "--porcelain=v1", "-z", "--untracked-files=all"]]);
  assert.equal(response.content[0].text, "Commit cancelled.");
});

test("stages only confirmed paths and checks staged diff before review", async () => {
  const calls = [];
  let quietChecks = 0;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    calls.push(args);
    if (args[0] === "diff" && args[2] === "--quiet") return { ...ok, code: quietChecks++ === 0 ? 0 : 1 };
    if (args[0] === "status") return { ...ok, stdout: " M tracked file\0?? new file\0" };
    return ok;
  }, submitted, async (paths) => {
    assert.deepEqual(paths, ["tracked file", "new file"]);
    return true;
  });
  assert.equal(response.isError, undefined);
  assert.deepEqual(calls, [
    ["diff", "--cached", "--quiet"],
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    ["--literal-pathspecs", "add", "--all", "--", "tracked file", "new file"],
    ["diff", "--cached", "--quiet"],
    ["diff", "--cached", "--check"],
    ["commit", "--file", calls[5][2]],
  ]);
});

test("staging error stops before review", async () => {
  let reviewed = false;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    if (args[0] === "status") return { ...ok, stdout: "?? new file\0" };
    if (args[0] === "--literal-pathspecs") return { ...ok, code: 1, stderr: "add failed" };
    return ok;
  }, async () => { reviewed = true; return submitted(); }, async () => true);
  assert.equal(reviewed, false);
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /some paths may be staged/);
});

test("whitespace check failure stops before review", async () => {
  let reviewed = false;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    if (args[2] === "--quiet") return { ...ok, code: 1 };
    return { ...ok, code: 1, stdout: "file: trailing whitespace." };
  }, async () => { reviewed = true; return submitted(); });
  assert.equal(reviewed, false);
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /git diff --cached --check/);
});

test("stages confirmed untracked paths in an isolated git repository", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "git-publish-stage-"));
  const filename = "new\nfile.txt";
  try {
    await execFileAsync("git", ["init", "--quiet"], { cwd });
    await writeFile(join(cwd, filename), "content\n");
    const exec = async (command, args, options) => {
      if (args[0] === "commit") {
        const { stdout } = await execFileAsync("git", ["diff", "--cached", "--name-only", "-z"], { cwd, encoding: "utf8" });
        assert.deepEqual(stdout.split("\0").filter(Boolean), [filename]);
        return ok;
      }
      try {
        const result = await execFileAsync(command, args, { cwd: options.cwd, encoding: "utf8" });
        return { stdout: result.stdout, stderr: result.stderr, code: 0 };
      } catch (error) {
        return { stdout: error.stdout ?? "", stderr: error.stderr ?? "", code: error.code ?? 1 };
      }
    };
    const response = await reviewAndPublish(proposal, cwd, undefined, exec, submitted, async (paths) => {
      assert.deepEqual(paths, [filename]);
      return true;
    });
    assert.equal(response.isError, undefined);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test("commit preflight failure stops before review", async () => {
  const response = await reviewAndPublish(proposal, "/test", undefined, async () => ({ ...ok, code: 2, stderr: "not a repository" }), async () => assert.fail("review should not open"));
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /Could not check staged changes/);
});

test("commit uses only reviewed content and deletes private message file", async () => {
  let file;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (command, args, options) => {
    if (args[0] === "diff" && args[2] === "--quiet") return { ...ok, code: 1 };
    if (args[0] === "diff" && args[2] === "--check") return ok;
    assert.equal(command, "git");
    assert.deepEqual(args.slice(0, 2), ["commit", "--file"]);
    assert.equal(options.cwd, "/test");
    file = args[2];
    assert.equal((await stat(file)).mode & 0o777, 0o600);
    assert.equal(await readFile(file, "utf8"), "feat: edited\n\nEdited body ✓\n");
    return ok;
  }, submitted);
  assert.equal(response.isError, undefined);
  await assert.rejects(stat(file), { code: "ENOENT" });
});

test("commit process error also removes message file", async () => {
  let file;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (_command, args) => {
    if (args[0] === "diff" && args[2] === "--quiet") return { ...ok, code: 1 };
    if (args[0] === "diff" && args[2] === "--check") return ok;
    file = args[2];
    throw new Error("exec error");
  }, submitted);
  assert.equal(response.isError, true);
  await assert.rejects(stat(file), { code: "ENOENT" });
});

test("PR pushes the checked-out branch and targets origin instead of the upstream fork parent", async () => {
  const calls = [];
  await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async (command, args, options) => {
    calls.push([command, args, options]);
    if (args[0] === "symbolic-ref") return { ...ok, stdout: "feature/captions\n" };
    if (args[0] === "remote") return { ...ok, stdout: "git@github.com:fork/project.git\n" };
    if (args[0] === "repo") return { ...ok, stdout: "https://github.com/fork/project\n" };
    return ok;
  }, submitted);
  assert.deepEqual(calls, [
    ["git", ["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd: "/test", signal: undefined }],
    ["git", ["remote", "get-url", "--push", "origin"], { cwd: "/test", signal: undefined }],
    ["gh", ["repo", "view", "git@github.com:fork/project.git", "--json", "url", "--jq", ".url"], { cwd: "/test", signal: undefined }],
    ["git", ["push", "--set-upstream", "origin", "refs/heads/feature/captions:refs/heads/feature/captions"], { cwd: "/test", signal: undefined }],
    ["gh", ["pr", "create", "--repo", "https://github.com/fork/project", "--head", "feature/captions", "--title", "feat: edited", "--body", "Edited body ✓"], { cwd: "/test", signal: undefined }],
  ]);
});

for (const stage of ["remote", "repo"]) {
  for (const failure of [{ ...ok, code: 1, stdout: "", stderr: "lookup failed" }, { ...ok, stdout: "" }]) {
    test(`PR stops before push when ${stage} lookup fails or returns no URL (code ${failure.code})`, async () => {
      const calls = [];
      const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async (_command, args) => {
        calls.push(args[0]);
        if (args[0] === "symbolic-ref") return { ...ok, stdout: "feature/captions\n" };
        if (args[0] === stage) return failure;
        if (args[0] === "remote") return { ...ok, stdout: "git@github.com:fork/project.git\n" };
        assert.fail("must not push or create a PR");
      }, submitted);
      assert.equal(response.isError, true);
      assert.match(response.content[0].text, /Nothing was pushed/);
      assert.deepEqual(calls, stage === "remote" ? ["symbolic-ref", "remote"] : ["symbolic-ref", "remote", "repo"]);
    });
  }
}

test("PR from detached HEAD stops before pushing", async () => {
  const calls = [];
  const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async (command, args, options) => {
    calls.push([command, args, options]);
    return { ...ok, code: 128, stderr: "fatal: ref HEAD is not a symbolic ref" };
  }, submitted);
  assert.equal(response.isError, true);
  assert.deepEqual(calls.map(([, args]) => args[0]), ["symbolic-ref"]);
});

test("failed push prevents PR", async () => {
  const calls = [];
  const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async (_command, args) => {
    calls.push(args[0]);
    if (args[0] === "symbolic-ref") return { ...ok, stdout: "feature/captions\n" };
    if (args[0] === "remote") return { ...ok, stdout: "https://github.com/fork/project.git\n" };
    if (args[0] === "repo") return { ...ok, stdout: "https://github.com/fork/project\n" };
    return { ...ok, code: 1, stderr: "push failed" };
  }, submitted);
  assert.deepEqual(calls, ["symbolic-ref", "remote", "repo", "push"]);
  assert.equal(response.isError, true);
});

test("abort after push prevents gh and reports potentially applied changes", async () => {
  const controller = new AbortController();
  const calls = [];
  const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", controller.signal, async (_command, args, options) => {
    assert.equal(options.signal, controller.signal);
    calls.push(args[0]);
    if (args[0] === "symbolic-ref") return { ...ok, stdout: "feature/captions\n" };
    if (args[0] === "remote") return { ...ok, stdout: "git@github.com:fork/project.git\n" };
    if (args[0] === "repo") return { ...ok, stdout: "https://github.com/fork/project\n" };
    controller.abort();
    return ok;
  }, submitted);
  assert.deepEqual(calls, ["symbolic-ref", "remote", "repo", "push"]);
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /may have taken effect/);
});
