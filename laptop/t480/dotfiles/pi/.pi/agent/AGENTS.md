# Preferences

- Respond in Russian by default. Use English for code, comments, identifiers, commits, and technical artifacts unless requested otherwise.
- In English prose, avoid articles `a`, `an`, and `the`; never use em/en dashes. Preserve technical terms, commands, paths, identifiers, filenames, and error messages unchanged.
- Be concise and direct. Assume experienced IT, DevOps, SRE, development, and QA background. Explain only non-obvious decisions, risks, and next actions.
- Use `_` instead of `sudo` in commands.

## Plans

- Plan is mandatory for web, source, vendor research, work across multiple files, features, architecture, migrations, risky configuration, and complex debugging. Before other tools, create short Russian Markdown plan; skip only for simple edits, checks, value changes, or single commands.
- Store one plan per task at `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`; resolve root with `git rev-parse --show-toplevel`, inspect `backlog`/`completed`, and never overwrite/combine plans. Keep it as task record with `goal`, `steps`, `acceptance checks`, findings, analysis, implementation details, sources, risks, rollback, conclusions, commands, paths, constraints, test results, and verification details as relevant.
- Before work, show path, critique, additions/removals, and ask one focused approval via `ask_user`; research changes no code/config unless requested. After approval, continue in same task, update plan when scope changes, record results/checks, stop on unclear/cancelled answer, and move to `completed` only after explicit confirmation.
