import assert from "node:assert/strict";
import test from "node:test";
import { getGitStatus, shortenBranch } from "../agterm-status/utils.ts";

const ok = (stdout = "") => ({ stdout, stderr: "", code: 0 });
const fail = () => ({ stdout: "", stderr: "not found", code: 1 });

function gitRepo({ branch = "main", status = "## main", pr = fail(), remoteDefault = "main", githubDefault = "main" } = {}) {
  return async (command, args) => {
    if (command === "git" && args[0] === "rev-parse" && args[1] === "--show-toplevel") return ok("/repo\n");
    if (command === "git" && args[0] === "branch") return ok(`${branch}\n`);
    if (command === "git" && args[0] === "status") return ok(`${status}\n`);
    if (command === "git" && args[0] === "symbolic-ref") return remoteDefault ? ok(`origin/${remoteDefault}\n`) : fail();
    if (command === "gh" && args[0] === "repo") return githubDefault ? ok(`${githubDefault}\n`) : fail();
    if (command === "gh" && args[0] === "pr") return pr;
    assert.fail(`Unexpected command: ${command} ${args.join(" ")}`);
  };
}

test("shortens long branch names while preserving prefix and suffix", () => {
  assert.equal(shortenBranch("feature/android-downloads"), "feature/…downloads");
  assert.equal(shortenBranch("feature/auth"), "feature/auth");
});

test("clears status outside a Git repository", async () => {
  let calls = 0;
  const status = await getGitStatus(async () => { calls++; return fail(); }, "/tmp");
  assert.equal(status, undefined);
  assert.equal(calls, 1);
});

test("shows branch and clean state when no PR exists", async () => {
  const status = await getGitStatus(gitRepo({ status: "## main...origin/main" }), "/repo");
  assert.equal(status, '🌿 main · ^[✓ clean](color: "green")');
});

test("uses GitHub default branch when Git remote HEAD is missing", async () => {
  const status = await getGitStatus(gitRepo({ branch: "trunk", status: "## trunk", remoteDefault: "", githubDefault: "trunk" }), "/repo");
  assert.equal(status, '🌿 trunk · ^[✓ clean](color: "green")');
});

test("shows changed files and upstream divergence", async () => {
  const status = await getGitStatus(gitRepo({
    branch: "feature/auth",
    status: "## feature/auth...origin/feature/auth [ahead 2, behind 1]\n M file.ts\n?? new.ts",
  }), "/repo");
  assert.equal(status, '🌱 feature/auth · ^[● 2](color: "orange") ↑2 ↓1');
});

test("shows discovered PR and review decision", async () => {
  const status = await getGitStatus(gitRepo({
    branch: "feature/auth",
    pr: { stdout: JSON.stringify({ number: 42, state: "OPEN", isDraft: false, reviewDecision: "APPROVED" }), stderr: "", code: 0 },
  }), "/repo");
  assert.equal(status, '🌱 feature/auth · ^[✓ clean](color: "green") · PR #42 approved');
});

test("keeps Git status when gh is unavailable", async () => {
  const status = await getGitStatus(async (command, args, options) => {
    if (command === "gh") throw new Error("gh unavailable");
    return gitRepo()(command, args, options);
  }, "/repo");
  assert.equal(status, '🌿 main · ^[✓ clean](color: "green")');
});
