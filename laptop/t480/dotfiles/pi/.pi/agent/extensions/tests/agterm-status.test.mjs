import assert from "node:assert/strict";
import test from "node:test";
import { escapeMarkdown, getGitStatus, shortenBranch } from "../agterm-status/utils.ts";

const ok = (stdout = "") => ({ stdout, stderr: "", code: 0 });
const fail = () => ({ stdout: "", stderr: "not found", code: 1 });

function gitRepo({ head = "main", oid = "1234567890abcdef", upstream = "origin/main", ab = "+0 -0", entries = "", pr = fail() } = {}) {
  const headers = [`# branch.oid ${oid}`, `# branch.head ${head}`];
  if (upstream) headers.push(`# branch.upstream ${upstream}`, `# branch.ab ${ab}`);
  const gitStatus = [...headers, entries].filter(Boolean).join("\n") + "\n";
  return async (command, args, options) => {
    assert.equal(options.cwd, "/repo");
    if (command === "git") {
      assert.deepEqual(args, ["--no-optional-locks", "status", "--porcelain=v2", "--branch", "--untracked-files=all"]);
      return ok(gitStatus);
    }
    if (command === "gh" && args[0] === "pr") return pr;
    assert.fail(`Unexpected command: ${command} ${args.join(" ")}`);
  };
}

test("clears status outside a Git repository", async () => {
  let calls = 0;
  const status = await getGitStatus(async () => { calls++; return fail(); }, "/tmp");
  assert.equal(status, undefined);
  assert.equal(calls, 1);
});

test("matches cookbook clean upstream branch format", async () => {
  const status = await getGitStatus(gitRepo(), "/repo");
  assert.equal(status, '🌿 **main** ^[✓ clean](color: "green")');
});

test("uses upstream state rather than default branch name", async () => {
  const status = await getGitStatus(gitRepo({ head: "trunk", upstream: "origin/trunk" }), "/repo");
  assert.equal(status, '🌿 **trunk** ^[✓ clean](color: "green")');
});

test("marks branch without upstream as local only", async () => {
  const status = await getGitStatus(gitRepo({ head: "feature/new", upstream: "" }), "/repo");
  assert.equal(status, '🌱 **feature/new** ^[✓ clean](color: "green") ^[local only](dim: true)');
});

test("shows detached HEAD by short object id", async () => {
  const status = await getGitStatus(gitRepo({ head: "(detached)", upstream: "" }), "/repo");
  assert.equal(status, '📍 **1234567** ^[detached](dim: true) ^[✓ clean](color: "green")');
});

test("counts tracked, untracked, and conflicted files and shows divergence", async () => {
  const status = await getGitStatus(gitRepo({
    head: "feature/auth",
    upstream: "origin/feature/auth",
    ab: "+2 -1",
    entries: "1 .M N... 100644 100644 100644 aaaa bbbb file.ts\n? new.ts\nu UU N... 100644 100644 100644 100644 aaaa bbbb cccc conflict.ts",
  }), "/repo");
  assert.equal(status, '🌿 **feature/auth** ^[● 3](color: "orange") ^[↑2](color: "blue") ^[↓1](color: "purple")');
});

test("shortens branch names while preserving prefix and suffix", async () => {
  assert.equal(shortenBranch("feature/android-downloads"), "feature/…downloads");
  assert.equal(shortenBranch("feature/auth"), "feature/auth");
  const status = await getGitStatus(gitRepo({ head: "feature/android-downloads" }), "/repo");
  assert.equal(status, '🌿 **feature/…downloads** ^[✓ clean](color: "green")');
});

test("escapes branch names before Markdown formatting", async () => {
  const status = await getGitStatus(gitRepo({ head: "feature/a_b`c" }), "/repo");
  assert.equal(status, '🌿 **feature/a\\_b\\`c** ^[✓ clean](color: "green")');
  assert.equal(escapeMarkdown("a]b"), "a\\]b");
});

test("shows an open PR and review decision", async () => {
  const status = await getGitStatus(gitRepo({
    pr: { stdout: JSON.stringify({ number: 42, state: "OPEN", isDraft: false, reviewDecision: "APPROVED" }), stderr: "", code: 0 },
  }), "/repo");
  assert.equal(status, '🌿 **main** ^[✓ clean](color: "green") · PR #42 approved');
});

test("omits merged, closed, and unavailable pull requests", async () => {
  for (const state of ["MERGED", "CLOSED"]) {
    const status = await getGitStatus(gitRepo({
      pr: { stdout: JSON.stringify({ number: 42, state, isDraft: false, reviewDecision: null }), stderr: "", code: 0 },
    }), "/repo");
    assert.equal(status, '🌿 **main** ^[✓ clean](color: "green")');
  }
  const status = await getGitStatus(async (command, args, options) => {
    if (command === "gh") throw new Error("gh unavailable");
    return gitRepo()(command, args, options);
  }, "/repo");
  assert.equal(status, '🌿 **main** ^[✓ clean](color: "green")');
});
