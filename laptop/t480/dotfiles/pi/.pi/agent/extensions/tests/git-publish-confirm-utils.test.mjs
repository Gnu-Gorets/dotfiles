import assert from "node:assert/strict";
import test from "node:test";
import { isProtectedCommand, parseMessage } from "../git-publish-confirm/utils.ts";

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
