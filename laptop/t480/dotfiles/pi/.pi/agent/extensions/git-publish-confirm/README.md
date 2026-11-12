# Publish review

`git_publish` opens standalone GTK editor for commit or PR title and body.
First line becomes title; remaining text becomes description.
Enter inserts newline. Ctrl+Enter or Submit confirms. Escape, Cancel and window close cancel.
Notes and File note are intentionally omitted: this flow edits text directly, without annotations.

Requires `/usr/bin/python3`, PyGObject, GTK3, Cairo and graphical display.
No agterm process or control socket is used. GUI startup or protocol errors stop publication without fallback.
Helper receives JSON through stdin and returns explicit submitted/cancelled JSON through stdout.

Abort closes editor and prevents subsequent publish steps. Already started git/gh operations cannot be rolled back automatically.
Commits include staged changes only. If the index is empty, the flow shows changed paths and asks before staging those exact paths. It runs `git diff --cached --check` before opening the commit editor. Cancelling the staging prompt leaves the index unchanged. Cancelling the message editor after staging leaves those paths staged. PR creation resolves the `origin` push URL with `gh repo view` before pushing. It pushes the current branch ref to `origin`, then passes the resolved repository URL through `gh pr create --repo` and the branch name through `--head`. This keeps PRs in the push repository, not its upstream parent. GitHub CLI still selects the base branch. Detached HEAD and repository lookup errors stop publication before push. Reload Pi with `/reload` after changing the extension.

Checks:

```sh
node --test ~/.pi/agent/extensions/tests/git-publish-confirm-*.test.mjs
/usr/bin/python3 -B ~/.pi/agent/extensions/tests/git-publish-confirm-gui.test.py -v
```

GTK tests use offscreen windows, not live terminal or publish commands.
