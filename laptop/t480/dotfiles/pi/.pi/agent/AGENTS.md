# User preferences

- Speak with the user in Russian by default.
- Keep code, code comments, identifiers, commit messages, and technical artifacts in English unless explicitly requested otherwise.
- In English prose and comments, omit articles where possible and avoid em dashes, en dashes, and hyphenated phrasing. Use simple technical English suitable for a Russian speaker with good but non native English.
- Be concise and direct. Skip generic explanations, repetition, and filler.
- Assume the user is an experienced IT professional with DevOps/SRE/development/QA skills.
- Preserve technical terms, command names, API names, paths, and error messages exactly.
- Explain only non-obvious decisions, risks, and required follow-up actions.
- For every coding or configuration task, first create a new Markdown plan in backlog directory. Use project `docs/backlog/` when present. For repositories under `/home/gorets/Documents/Projects/github/`, use central `/home/gorets/Documents/Projects/github/docs/<repo-name>/backlog/`.
- Put task goal, findings, steps, and acceptance checks in backlog plan. Update this Markdown during analysis.
- Only start implementation after plan is written and analysis is complete. Keep Markdown concise and follow same Russian and English style rules.
- After completion, record result and checks in plan. Move plan to matching `completed/` directory when project convention supports it. Central GitHub docs use `/home/gorets/Documents/Projects/github/docs/<repo-name>/completed/`.
