import assert from "node:assert/strict";
import test from "node:test";
import { isProtectedCommand, parseAgtermAskResult, parseMessage } from "../git-publish-confirm/utils.ts";

test("protects commit and GitHub PR commands", () => {
  assert.equal(isProtectedCommand("git commit -m 'title'"), true);
  assert.equal(isProtectedCommand("git -C /repo commit --file message"), true);
  assert.equal(isProtectedCommand("gh pr create --title title"), true);
  assert.equal(isProtectedCommand("git status && gh pr create"), true);
  assert.equal(isProtectedCommand("git status && gh pr list"), false);
});

test("splits reviewed message into title and description", () => {
  assert.deepEqual(parseMessage("  feat: add login\n\nDescription\n"), {
    title: "feat: add login",
    description: "Description",
  });
  assert.equal(parseMessage(" \n "), undefined);
});

test("accepts submitted agterm dialog text", () => {
  assert.deepEqual(
    parseAgtermAskResult('{"result":"answered","id":"submit","text":"feat: title\\n\\nbody"}', 0),
    { status: "submitted", text: "feat: title\n\nbody" },
  );
});

test("treats cancel and escape as dialog cancellation", () => {
  assert.deepEqual(parseAgtermAskResult("", 2), { status: "cancelled" });
  assert.deepEqual(parseAgtermAskResult("", 3), { status: "cancelled" });
});

test("falls back when agterm is unavailable", () => {
  assert.deepEqual(parseAgtermAskResult("", 1), { status: "unavailable" });
});

test("rejects malformed or unexpected agterm responses", () => {
  assert.deepEqual(parseAgtermAskResult("not JSON", 0), { status: "invalid" });
  assert.deepEqual(parseAgtermAskResult('{"result":"answered","id":"cancel","text":"x"}', 0), {
    status: "invalid",
  });
});
