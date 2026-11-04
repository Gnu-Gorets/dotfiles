import assert from "node:assert/strict";
import test from "node:test";
import agtermStatus from "../agterm-status.ts";

const gitStatus = [
  "# branch.oid 1234567890abcdef",
  "# branch.head main",
  "# branch.upstream origin/main",
  "# branch.ab +0 -0",
].join("\n") + "\n";

function makePi(exec) {
  const handlers = new Map();
  agtermStatus({
    on: (name, handler) => handlers.set(name, handler),
    exec,
  });
  return handlers;
}

function setEnv(name, value) {
  const old = process.env[name];
  process.env[name] = value;
  return () => old === undefined ? delete process.env[name] : process.env[name] = old;
}

test("session start sets a refreshing expiry and shutdown clears the line", async () => {
  const restore = setEnv("AGTERM_SESSION_ID", "test-session");
  const restoreSocket = setEnv("AGTERM_SOCKET", "");
  const calls = [];
  try {
    const handlers = makePi(async (command, args) => {
      if (command === "git") return { stdout: gitStatus, stderr: "", code: 0 };
      if (command === "gh") return { stdout: "", stderr: "no PR", code: 1 };
      if (command === "agtermctl") calls.push(args);
      return { stdout: "", stderr: "", code: 0 };
    });

    await handlers.get("session_start")({}, { cwd: "/repo", mode: "tui" });
    assert.deepEqual(calls[0].slice(0, 6), [
      "session", "info", "🌿 **main** ^[✓ clean](color: \"green\")", "--markdown", "--hide-after", "86400",
    ]);
    assert.deepEqual(calls[0].slice(-2), ["--target", "test-session"]);

    await handlers.get("session_shutdown")({});
    assert.deepEqual(calls[1], ["session", "info", "--clear", "--target", "test-session"]);
  } finally {
    restoreSocket();
    restore();
  }
});

test("refreshes after a Git-relevant tool completes", async () => {
  const restore = setEnv("AGTERM_SESSION_ID", "test-session");
  const restoreSocket = setEnv("AGTERM_SOCKET", "");
  const calls = [];
  try {
    const handlers = makePi(async (command, args) => {
      if (command === "git") return { stdout: gitStatus, stderr: "", code: 0 };
      if (command === "gh") return { stdout: "", stderr: "no PR", code: 1 };
      if (command === "agtermctl") calls.push(args);
      return { stdout: "", stderr: "", code: 0 };
    });
    await handlers.get("session_start")({}, { cwd: "/repo", mode: "tui" });
    handlers.get("tool_execution_end")({ toolName: "bash" }, { cwd: "/repo" });
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal(calls.filter((args) => args[0] === "session").length, 2);
    await handlers.get("session_shutdown")({});
  } finally {
    restoreSocket();
    restore();
  }
});

test("headless sessions do not overwrite the agterm line", async () => {
  const restore = setEnv("AGTERM_SESSION_ID", "test-session");
  const restoreSocket = setEnv("AGTERM_SOCKET", "");
  const calls = [];
  try {
    const handlers = makePi(async (command, args) => {
      if (command === "agtermctl") calls.push(args);
      return { stdout: gitStatus, stderr: "", code: 0 };
    });
    await handlers.get("session_start")({}, { cwd: "/repo", mode: "print" });
    await handlers.get("session_shutdown")({});
    assert.deepEqual(calls, []);
  } finally {
    restoreSocket();
    restore();
  }
});

test("shutdown clear cannot be overwritten by an in-flight Git refresh", async () => {
  const restore = setEnv("AGTERM_SESSION_ID", "test-session");
  const restoreSocket = setEnv("AGTERM_SOCKET", "");
  let started;
  let release;
  const gitStarted = new Promise((resolve) => { started = resolve; });
  const gitGate = new Promise((resolve) => { release = resolve; });
  const calls = [];
  try {
    const handlers = makePi(async (command, args) => {
      if (command === "git") {
        started();
        await gitGate;
        return { stdout: gitStatus, stderr: "", code: 0 };
      }
      if (command === "agtermctl") calls.push(args);
      return { stdout: "", stderr: "", code: 1 };
    });

    const start = handlers.get("session_start")({}, { cwd: "/repo", mode: "tui" });
    await gitStarted;
    const shutdown = handlers.get("session_shutdown")({});
    release();
    await Promise.all([start, shutdown]);

    assert.deepEqual(calls, [["session", "info", "--clear", "--target", "test-session"]]);
  } finally {
    restoreSocket();
    restore();
  }
});
