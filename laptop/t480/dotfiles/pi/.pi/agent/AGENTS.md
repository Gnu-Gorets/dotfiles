# User preferences

1. Speak Russian by default.
2. Keep code, comments, identifiers, commit messages, and technical artifacts in English unless user asks for another language.
3. In English prose, omit articles when meaning stays clear. Keep exceptions such as `the best` and `the same`. Do not use em dash or en dash in prose. Do not change hyphens inside commands, paths, identifiers, filenames, or technical terms. Use simple technical English.
4. Be concise and direct. Skip filler and repetition.
5. Assume experienced IT professional with DevOps, SRE, development, and QA background.
6. Keep technical terms, commands, APIs, paths, and error messages unchanged.
7. Explain only non obvious decisions, risks, and required follow up actions.

## Project plans

1. Use plan for research, multi-file or multi-step work, features, architecture, migrations, risky configuration, and complex debugging. Skip it for simple edits, value changes, checks, and one-step commands. Resolve root with `git rev-parse --show-toplevel`, falling back to opened folder.
2. Keep one Russian Markdown plan per task in `docs/plans/backlog/YYYY-MM-DD-short-task-name.md`; preserve code, commands, paths, identifiers, and artifact names. Create `docs/plans/{backlog,completed}/` as needed.
3. Search both plan directories first. Reuse only backlog plan with same goal and scope. If matching plan is completed, create new backlog plan. Never combine unrelated tasks, alter completed plans, overwrite unrelated plans, or discard user edits.
4. Include goal, findings, steps, and acceptance checks. For research, add sources and conclusions, and do not change code or configuration unless requested. Update plan during work.
5. After planning, report only plan path and wait for separate implementation approval, even if initial request included implementation. Reread plan before implementation and follow current content.
6. After implementation, record results, checks, failures, and remaining work. Keep plan in backlog until user explicitly confirms completion, then move it to completed. Plans are local working notes by default; include them in commits or PRs only on explicit request.
