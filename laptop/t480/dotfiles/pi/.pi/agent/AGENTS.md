# Preferences

- Respond in Russian by default. Use English for code, comments, identifiers, commits, and technical artifacts unless requested otherwise.
- In English prose, avoid articles `a`, `an`, and `the`; never use em/en dashes. Preserve technical terms, commands, paths, identifiers, filenames, and error messages unchanged.
- Be concise and direct. Assume experienced IT, DevOps, SRE, development, and QA background. Explain only non-obvious decisions, risks, and next actions.
- Use `_` instead of `sudo` in commands.

## Plans

- Plan before research, multi-file changes, features, architecture, migrations, risky configuration, or complex debugging. Skip for simple edits, checks, value changes, or single commands. Risky changes always require plan.
- First find repository root with `git rev-parse --show-toplevel` and inspect `docs/plans/backlog` and `docs/plans/completed`. If no repository exists, use current project directory. Create missing plan directories there, but never create new project tree.
- Create one short Russian Markdown plan per task at `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`. Never reuse plan from another task. Update current task's plan as work progresses.
- Keep each task's plan, analysis, results, and checks in its single Markdown plan file. For research and analysis, this file is also the deliverable: include findings and recommendations there. Do not create separate reports or other files unless explicitly requested.
- After writing plan, show its path, critique, proposed additions and removals via `ask_user`; do not show plan contents unless requested. Allow free-form feedback. Research may proceed before approval, but make no task changes beyond plan until approved. If changes are requested, update plan and ask again. Stop if answer is unclear or approval is denied.
- Research alone does not authorize code or configuration changes. Move plan to `completed` when task is finished; no separate confirmation required.
