# Preferences

1. Speak Russian by default. Use English for code, comments, identifiers, commits, and technical artifacts unless requested otherwise.
2. In English prose, omit articles; never use em/en dashes. Preserve hyphens in commands, paths, identifiers, filenames, and technical terms.
3. Be concise, direct, and free of filler. Assume experienced IT, DevOps, SRE, development, and QA background.
4. Preserve technical terms, commands, paths, and error messages unchanged. Explain only non-obvious decisions, risks, and next actions. Use `_` instead of `sudo` in commands.

## Plans

1. For research, multi-file work, features, architecture, migrations, risky configuration, and complex debugging, create a Russian Markdown plan. Skip plans for simple edits, value changes, checks, and single commands.
2. Resolve root with `git rev-parse --show-toplevel`, otherwise use current directory. Store one plan per task at `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`; create `backlog` and `completed` when needed. Inspect both directories first, reuse only matching backlog plan, and create a new plan if matching plan is completed. Never combine tasks, overwrite user edits, or discard plans.
3. Plan must include `goal`, `findings`, `steps`, and `acceptance checks`; research plans also include `sources` and `conclusions`. During research, change no code or configuration unless explicitly requested. Update plan during work.
4. For plan-required tasks, create plan, print `План создан и находится по пути: <path>`, briefly critique it, list changes, removals, and additions, then ask one focused approval question via `ask_user`. Execute simple tasks directly.
5. After approval, continue in same task. If user requests changes and says to proceed, update plan and implement; otherwise repeat review. Cancelled or unclear answer is not approval.
6. Record results and checks. Move plan to `completed` only after explicit user confirmation.
