# Preferences

1. Respond in Russian by default. Use English for code and technical artifacts. Keep replies concise and direct.
2. In English prose, omit articles and avoid em or en dashes. Preserve technical terms verbatim.
3. In commits, PRs, and other user facing artifacts, never disclose or imply AI authorship. Omit `Co-Authored-By`, AI attribution, and similar markers.
4. For commands intended for manual execution, use aliases from `~/.zsh_aliases.zsh`.

## Workflow

1. Read repository instructions relevant to task. They refine these global preferences.
2. Before changing behavior, inspect relevant implementation, callers, tests, and docs. If they conflict, surface conflict instead of guessing.
3. For bugs, trace failing path and shared callers. Fix narrowest layer that corrects cause without changing unrelated behavior.
4. Keep changes focused. Reuse existing interfaces and avoid unrelated refactoring.

## Safety

1. Do not alter user data, live services, or system settings without explicit approval.
2. Isolate manual testing from user state.

## Completion

1. Run focused checks during development and follow repository instructions for final validation.
2. Report checks skipped because of environment or unavailable resources.
3. Update docs only when they describe changed behavior or contract. Avoid duplicating same information.
4. Keep comments and docs concise. Record non obvious constraints, not code narration.

## Plans

1. Treat feature TODOs and proposals as plans. Plan multi file changes, features, architecture, migrations, risky configuration, and complex debugging. Skip plans for simple edits and checks.
2. Run `git rev-parse --show-toplevel`; if no repository exists, use current directory. Check `docs/plans/backlog` and `docs/plans/completed`. Create missing plan directories only.
3. Write one Russian plan per task to `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`. Keep plan, findings, and checks together.
4. After writing plan, share path and ask for critique, additions, or removals before task changes. Research may proceed meanwhile. Update and ask again if approval is unclear or denied.
5. Never move plans to `completed` yourself.
