# Preferences

- Respond in Russian by default; use English for code and technical artifacts. Keep replies concise and direct.
- In English prose, omit articles and avoid em or en dashes. Preserve technical terms verbatim.
- In commits, PRs, and other user-facing artifacts, never disclose or imply AI authorship; omit `Co-Authored-By`, AI attribution, and similar markers.
- For commands intended for manual execution, use aliases from `~/.zsh_aliases.zsh`.

## Plans

- Plan multi-file changes, features, architecture, migrations, risky configuration, and complex debugging. Skip plans for simple edits and checks.
- Run `git rev-parse --show-toplevel`; if no repository exists, use current directory. Check `docs/plans/backlog` and `docs/plans/completed`; create missing plan directories only.
- Write one Russian plan per task to `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`. Keep plan, findings, and checks together.
- After writing plan, share path and ask for critique, additions, or removals before task changes. Research may proceed meanwhile. Update and ask again if approval is unclear or denied.
- Move finished plans to `completed`; no extra confirmation needed.
