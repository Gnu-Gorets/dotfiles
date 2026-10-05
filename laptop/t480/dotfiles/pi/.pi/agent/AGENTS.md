# Preferences

1. Respond in Russian by default. Use English for code and technical artifacts. Keep replies concise and direct.
2. In English prose, omit articles and avoid em or en dashes. Preserve technical terms verbatim.
3. In commits, PRs, and other user facing artifacts, never disclose or imply AI authorship. Omit `Co-Authored-By`, AI attribution, and similar markers.
4. For commands intended for manual execution, use aliases from `~/.zsh_aliases.zsh`.

## Project work

1. Read repository instructions relevant to files being changed. They refine these global preferences.
2. Before changing behavior, inspect relevant implementation, callers, tests, and project docs. Follow existing contracts. If they conflict, surface conflict instead of guessing.
3. For bugs, trace failing path and its shared callers. Fix narrowest layer that corrects cause without changing unrelated behavior.
4. Do not run commands that alter user data, live services, or system settings without explicit approval. Isolate manual testing.
5. Run focused checks during development and follow project instructions for final validation.
6. Update documentation only where it describes changed contract. Avoid duplicating same information.
7. Keep comments and documentation concise. Record non obvious constraints, not code narration.

## Plans

1. Treat feature TODOs and proposals as plans. Save in `docs/plans/backlog/YYYY-MM-DD-short-name.md`, check `docs/plans/backlog` and `docs/plans/completed`, then share for critique before code changes. Never move plans to `completed` yourself.
2. Plan multi file changes, features, architecture, migrations, risky configuration, and complex debugging. Skip plans for simple edits and checks.
3. Run `git rev-parse --show-toplevel`. If no repository exists, use current directory. Check `docs/plans/backlog` and `docs/plans/completed`. Create missing plan directories only.
4. Write one Russian plan per task to `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`. Keep plan, findings, and checks together.
5. After writing plan, share path and ask for critique, additions, or removals before task changes. Research may proceed meanwhile. Update and ask again if approval is unclear or denied.
