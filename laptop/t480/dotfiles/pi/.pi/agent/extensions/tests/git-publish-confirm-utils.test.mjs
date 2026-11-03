import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { isProtectedCommand, parseMessage } from "../git-publish-confirm/utils.ts";
import { parseReviewResult } from "../git-publish-confirm/gui.ts";
import { reviewAndPublish } from "../git-publish-confirm/publish.ts";

const proposal = { action: "commit", title: "fix: original", description: "Original body" };
const submitted = async () => ({ status: "submitted", text: "feat: edited\n\nEdited body ✓" });
const ok = { code: 0, stdout: "done", stderr: "" };

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
      await reviewAndPublish({ ...proposal, action }, "/test", undefined, async () => { calls++; return ok; }, review);
      assert.equal(calls, 0);
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
  await reviewAndPublish(proposal, "/test", controller.signal, async () => assert.fail("exec"), async () => {
    controller.abort();
    return submitted();
  });
});

test("commit uses only reviewed content and deletes private message file", async () => {
  let file;
  const response = await reviewAndPublish(proposal, "/test", undefined, async (command, args, options) => {
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
    file = args[2];
    throw new Error("exec error");
  }, submitted);
  assert.equal(response.isError, true);
  await assert.rejects(stat(file), { code: "ENOENT" });
});

test("PR pushes then creates PR using reviewed title and body", async () => {
  const calls = [];
  await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async (...args) => { calls.push(args); return ok; }, submitted);
  assert.deepEqual(calls, [
    ["git", ["push", "--set-upstream", "origin", "HEAD"], { cwd: "/test", signal: undefined }],
    ["gh", ["pr", "create", "--title", "feat: edited", "--body", "Edited body ✓"], { cwd: "/test", signal: undefined }],
  ]);
});

test("failed push prevents PR", async () => {
  let calls = 0;
  const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", undefined, async () => {
    calls++;
    return { ...ok, code: 1, stderr: "push failed" };
  }, submitted);
  assert.equal(calls, 1);
  assert.equal(response.isError, true);
});

test("abort after push prevents gh and reports potentially applied changes", async () => {
  const controller = new AbortController();
  let calls = 0;
  const response = await reviewAndPublish({ ...proposal, action: "pr" }, "/test", controller.signal, async (_command, _args, options) => {
    assert.equal(options.signal, controller.signal);
    calls++;
    controller.abort();
    return ok;
  }, submitted);
  assert.equal(calls, 1);
  assert.equal(response.isError, true);
  assert.match(response.content[0].text, /may have taken effect/);
});
