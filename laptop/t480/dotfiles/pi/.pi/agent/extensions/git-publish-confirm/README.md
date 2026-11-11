# Publish review

`git_publish` opens standalone GTK editor for commit or PR title and body.
First line becomes title; remaining text becomes description.
Enter inserts newline. Ctrl+Enter or Submit confirms. Escape, Cancel and window close cancel.
Notes and File note are intentionally omitted: this flow edits text directly, without annotations.

Requires `/usr/bin/python3`, PyGObject, GTK3, Cairo and graphical display.
No agterm process or control socket is used. GUI startup or protocol errors stop publication without fallback.
Helper receives JSON through stdin and returns explicit submitted/cancelled JSON through stdout.

Abort closes editor and prevents subsequent publish steps. Already started git/gh operations cannot be rolled back automatically.
Commits include staged changes only. If the index is empty, the flow shows changed paths and asks before staging those exact paths. It runs `git diff --cached --check` before opening the commit editor. Cancelling the staging prompt leaves the index unchanged. Cancelling the message editor after staging leaves those paths staged. PR creation pushes current branch ref to `origin` first, then passes that branch and origin owner explicitly to `gh`. GitHub CLI continues to choose target repository and base using its configured context. Detached HEAD and origins without an owner/repository path are rejected before pushing.

Checks:

```sh
node --test ~/.pi/agent/extensions/tests/git-publish-confirm-*.test.mjs
/usr/bin/python3 -B ~/.pi/agent/extensions/tests/git-publish-confirm-gui.test.py -v
```

GTK tests use offscreen windows, not live terminal or publish commands.
