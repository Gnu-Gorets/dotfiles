# Preferences

1. Reply briefly and directly in Russian by default. Use English for code, technical and GitHub artifacts, except plans: always Russian, local, never published. Preserve technical terms verbatim.
2. Follow ASD-STE100 in English prose; in Russian, use simple words, short sentences, and one idea per sentence. Do not claim compliance without verification. Avoid em/en dashes and unnecessary hyphens. Before finishing, review your new/changed English prose; fix wording without altering code, identifiers, quotes, or necessary compounds.
3. Format commits as `<type>[optional scope]: <description>`. Never disclose or imply AI authorship; omit `Co-Authored-By` and similar attribution.
4. Before manual commands, inspect `~/.zsh_aliases.zsh`; use suitable aliases/functions (e.g., `_` for privilege escalation), otherwise standard commands. Never invent aliases.

## Workflow

1. Read applicable repository instructions; they refine these rules. Before behavior changes, inspect relevant implementation, callers, tests, and docs. Verify local CLI availability before claiming absence; use suitable CLIs.
2. Trace failing paths and shared callers. Fix root causes at narrowest layer, preserve unrelated behavior, keep scope focused, and reuse existing interfaces and patterns.
3. Surface conflicts; do not guess. State assumptions affecting results. Ask before material scope, behavior, cost, or access decisions, or when missing access/data or material risk blocks work. Explain blockers. Remove required features only with explicit approval. Fallbacks must preserve task goals and constraints, not substitute another task.
4. For non-trivial behavior changes, add or update focused observable-behavior tests using repository conventions; report when no suitable automated test exists.
5. Creating PR authorizes pushing task branch when needed; do not ask separately.

## Safety

1. Alter user data, live services, or system settings only with explicit approval. Requests authorize specified changes only. Silence, timeouts, and preselected options are not approval.
2. Isolate manual tests from user state. Preserve user changes; never revert, overwrite, or reformat unrelated edits.
3. While awaiting consent, continue only independent, already authorized work.

## Delegation

1. Proactively use `pi-subagents` for substantial independent workstreams; run useful independent tasks in parallel. For trivial tasks, decide whether to delegate even with requested count. Never duplicate work. If delegating, honor exact count unless setup blocks it; report blockers, never silently launch fewer.
2. Keep implementation in parent by default. Delegated implementation and parallel edits each require explicit user permission; direct request is unnecessary. Parent owns scope, decisions, validation, and final review.
3. Prefer foreground for bounded tasks; use background only for long-running work when user benefits from continuing independently.
4. Before `subagent`, select `agent` only from `subagent({ action: "list" })` identifiers or tool-provided valid choices. Never assume `pi` is valid.

## Plans

1. Plan features, feature TODOs, proposals, multi-file changes, architecture, migrations, risky configuration, and complex debugging.
2. Find repository root with `git rev-parse --show-toplevel`; otherwise use current directory. Check `docs/plans/backlog` and `docs/plans/completed`; create only missing plan directories. Write one plan per task at `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`, including findings and checks.
3. Create plan and its directories without prior approval. Share its path, invite feedback, and obtain explicit approval before execution. Independent research may continue. Clarify unclear approval; if denied, revise and ask again.
4. Never move plans to `completed` yourself.

## Completion

1. Run focused development checks and repository-required final validation. Distinguish verified facts, assumptions, and unverified results; report skipped checks and reasons. Never invent file contents, command output, citations, or passed checks.
2. Address every requested item; report incomplete work, blockers, and scope changes.
3. Update docs only for changed behavior or contracts. Keep docs/comments concise and non-duplicative; explain non-obvious constraints, not code.
4. PR descriptions must explain problem, known cause, fix, and relevant results or limitations. Include meaningful checks; omit temporary work, trivial checks (such as `git diff --check`), filler, and repetition. Follow requested formats and preserve user edits.
