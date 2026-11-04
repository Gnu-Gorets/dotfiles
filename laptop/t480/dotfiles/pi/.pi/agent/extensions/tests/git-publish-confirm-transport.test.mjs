import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";
import { openPublishDialog } from "../git-publish-confirm/gui.ts";

function processStub() {
  const child = new EventEmitter();
  child.stdin = new PassThrough();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => { queueMicrotask(() => child.emit("close", null)); return true; };
  return child;
}

test("review passes JSON through stdin, never shell or message argv", async () => {
  const child = processStub();
  const title = "Commit: 'quoted' $(no shell)";
  let request = "";
  child.stdin.on("data", (chunk) => { request += chunk; });
  const answer = openPublishDialog(title, "text ✓", undefined, (command, args, options) => {
    assert.equal(command, "/usr/bin/python3");
    assert.equal(args.length, 2);
    assert.equal(args[0], "-B");
    assert.match(args[1], /git-publish-confirm\/gui\.py$/);
    assert.deepEqual(options, { stdio: ["pipe", "pipe", "pipe"] });
    return child;
  });
  const bytes = Buffer.from('{"status":"submitted","text":"✓"}');
  child.stdout.write(bytes.subarray(0, bytes.length - 3));
  child.stdout.write(bytes.subarray(bytes.length - 3));
  child.emit("close", 0);
  assert.deepEqual(await answer, { status: "submitted", text: "✓" });
  assert.deepEqual(JSON.parse(request), { title, text: "text ✓" });
});

test("already aborted review never starts process", async () => {
  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(await openPublishDialog("title", "text", controller.signal, () => assert.fail("spawn")), { status: "cancelled" });
});

test("abort terminates helper and discards submitted data", async () => {
  const controller = new AbortController();
  const child = processStub();
  const answer = openPublishDialog("title", "text", controller.signal, () => child);
  child.stdout.write('{"status":"submitted","text":"not approved"}');
  controller.abort();
  assert.deepEqual(await answer, { status: "cancelled" });
});

test("spawn failure cannot confirm publication", async () => {
  const child = processStub();
  const answer = openPublishDialog("title", "text", undefined, () => child);
  child.emit("error", new Error("not found"));
  child.emit("close", -2);
  await assert.rejects(answer, /not found/);
});

test("nonzero exit cannot confirm even with submitted JSON", async () => {
  const child = processStub();
  const answer = openPublishDialog("title", "text", undefined, () => child);
  child.stdout.write('{"status":"submitted","text":"text"}');
  child.stderr.write("startup error");
  child.emit("close", 1);
  await assert.rejects(answer, /startup error/);
});

test("oversized output terminates helper without confirmation", async () => {
  const child = processStub();
  const answer = openPublishDialog("title", "text", undefined, () => child);
  child.stdout.write("x".repeat(1024 * 1024 + 1));
  await assert.rejects(answer, /too large/);
});
