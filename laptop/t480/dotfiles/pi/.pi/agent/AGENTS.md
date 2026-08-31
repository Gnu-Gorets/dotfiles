# User preferences

1. Speak Russian by default.
2. Keep code, comments, identifiers, commit messages, and technical artifacts in English unless user asks for another language.
3. In English prose, omit articles when meaning stays clear. Keep exceptions such as `the best` and `the same`. Do not use em dash or en dash in prose. Do not change hyphens inside commands, paths, identifiers, filenames, or technical terms. Use simple technical English.
4. Be concise and direct. Skip filler and repetition.
5. Assume experienced IT professional with DevOps, SRE, development, and QA background.
6. Keep technical terms, commands, APIs, paths, and error messages unchanged.
7. Explain only non obvious decisions, risks, and required follow up actions.

## Project plans

1. First decide if project work needs a plan. A plan is needed for research, changes in several files, new features, architecture decisions, migrations, risky configuration changes, complex debugging, or work with several steps. A plan is not needed for simple local edits, typos, simple value changes, checks, or one step commands. If this section applies, find project root with `git rev-parse --show-toplevel`. If command succeeds, use returned Git root. If command fails, use opened folder root.
2. After finding project root, check existing `docs/plans/backlog/`. Create `docs/plans/`, `docs/plans/backlog/`, and `docs/plans/completed/` as needed before creating or updating task plan. Store one task plan in one Markdown file in `docs/plans/backlog/`. Name file `YYYY-MM-DD-short-task-name.md` with lowercase kebab case.
3. Write every plan in Russian. Keep code, commands, paths, identifiers, and technical artifact names unchanged.
4. Include goal, findings, steps, and acceptance checks. Update plan during analysis.
5. For project research, include sources and conclusions. Do not change code or configuration unless user asks.
6. Search both `docs/plans/backlog/` and `docs/plans/completed/` for matching task plans. A matching plan must have same goal and scope as current task. Matching keywords are not enough. If matching plan exists in `docs/plans/backlog/`, update it. If matching plan exists only in `docs/plans/completed/`, create new plan file in `docs/plans/backlog/` and do not change completed file. Create new file only for new independent task. Do not combine unrelated tasks or overwrite unrelated plan files.
7. After creating plan, do not print its content. Tell user its path.
8. When this section applies, finish analysis and create or update task plan. Then stop and wait for explicit user instruction to implement plan. Even if original request asks for implementation, do not implement until user gives separate instruction. Before implementation, reread current task plan because user may have edited it locally. Follow current plan content. When updating task plan, preserve user changes and do not replace whole file without need. Do not start implementation until user says to proceed, for example `делай по плану`.
9. After project work, add result, checks, failures, and remaining work to same task plan. Keep file in `docs/plans/backlog/` until user explicitly confirms completion with wording such as `план сделан` or `задача завершена`. Do not infer confirmation from silence, implementation completion, or result report. Do not move file automatically. Move it to `docs/plans/completed/` only after explicit user confirmation or request.
