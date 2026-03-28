# VSCodium

1. Install VSCodium
2. Add [VS Code Marketplace](https://github.com/OliverKeefe/vscode-extensions-in-vscodium?tab=readme-ov-file#how-to-use-the-vs-code-marketplace)
3. Install extensions:

   ```zsh
   └> codium --profile stable --list-extensions
   4ops.terraform
   alefragnani.project-manager
   charliermarsh.ruff
   emeraldwalk.runonsave
   esbenp.prettier-vscode
   github.copilot
   github.copilot-chat
   github.vscode-pull-request-github
   hashicorp.terraform
   luisfontes19.vscode-swissknife
   mhutchie.git-graph
   ms-kubernetes-tools.vscode-kubernetes-tools
   ms-python.python
   ms-python.vscode-pylance
   oderwat.indent-rainbow
   openai.chatgpt
   pkief.material-icon-theme
   redhat.ansible
   redhat.vscode-yaml
   ryanabx.godot-vscode-theme
   streetsidesoftware.code-spell-checker
   streetsidesoftware.code-spell-checker-russian
   the0807.uv-toolkit
   tim-koehler.helm-intellisense
   ```

4. Add settings.json to current profile:

   ```json
   {
     // =========================
     // Accessibility
     // =========================
     "accessibility.verbosity.inlineChat": false,
     "accessibility.verbosity.panelChat": false,

     // =========================
     // AI / Chat
     // =========================
     "chat.editor.fontSize": 12,
     "chat.mcp.access": "none",
     "chat.tools.terminal.preventShellHistory": false,
     "chat.useAgentSkills": true,
     "chat.viewSessions.orientation": "auto",
     "claudeCode.initialPermissionMode": "acceptEdits",
     "claudeCode.selectedModel": "default",
     "inlineChat.holdToSpeech": false,

     // =========================
     // Ansible
     // =========================
     "ansible.validation.lint.enabled": true,
     "ansible.validation.lint.path": "ansible-lint",

     // =========================
     // Diff editor
     // =========================
     "diffEditor.ignoreTrimWhitespace": false,
     "diffEditor.maxComputationTime": 5000,

     // =========================
     // Editor: common behavior + formatting
     // =========================
     "editor.codeActionsOnSave": {
       "source.fixAll": "explicit",
       "source.organizeImports": "explicit"
     },
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.detectIndentation": false,
     "editor.fontLigatures": false,
     "editor.fontSize": 13,
     "editor.formatOnSave": true,
     "editor.formatOnSaveMode": "file",
     "editor.insertSpaces": true,
     "editor.largeFileOptimizations": true,
     "editor.minimap.enabled": false,
     "editor.rulers": [80, 95, 110],
     "editor.tabSize": 2,
     "editor.wordWrap": "on",

     // =========================
     // Files
     // =========================
     "files.associations": {
       "**/*.gotmpl": "helm",
       "**/*.tpl": "helm",
       "**/templates/*.yaml": "helm",
       "**/templates/*.yml": "helm"
     },
     "files.eol": "\n",
     "files.insertFinalNewline": true,
     "files.trimFinalNewlines": true,
     "files.trimTrailingWhitespace": true,

     // =========================
     // Git / SCM
     // =========================
     "git.autofetch": "all",
     "git.confirmSync": false,
     "git.ignoreRebaseWarning": true,
     "git.repositoryScanMaxDepth": 6,
     "git.replaceTagsWhenPull": true,
     "git-graph.commitDetailsView.fileView.type": "File List",
     "git-graph.contextMenuActionsVisibility": {},
     "git-graph.date.format": "ISO Date & Time",
     "scm.alwaysShowRepositories": true,
     "scm.defaultViewSortKey": "name",
     "scm.inputFontSize": 12,
     "scm.repositories.explorer": true,
     "scm.repositories.selectionMode": "single",

     // =========================
     // Language overrides
     // =========================
     "[dockercompose]": {
       "editor.autoIndent": "advanced",
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.insertSpaces": true,
       "editor.quickSuggestions": {
         "comments": false,
         "other": true,
         "strings": true
       },
       "editor.tabSize": 2
     },
     "[helm]": { "editor.formatOnSave": false },
     "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[jsonc]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[markdown]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[python]": {
       "editor.codeActionsOnSave": {
         "source.fixAll.ruff": "explicit",
         "source.organizeImports.ruff": "explicit"
       },
       "editor.defaultFormatter": "charliermarsh.ruff",
       "editor.formatOnSave": true,
       "editor.insertSpaces": true,
       "editor.tabSize": 4
     },
     "[terraform]": {
       "editor.defaultFormatter": "hashicorp.terraform",
       "editor.formatOnSave": true
     },
     "[terraform-vars]": {
       "editor.defaultFormatter": "hashicorp.terraform",
       "editor.formatOnSave": true
     },
     "[yaml]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.insertSpaces": true,
       "editor.tabSize": 2
     },

     // =========================
     // Project Manager
     // =========================
     "projectManager.any.maxDepthRecursion": 6,
     "projectManager.git.baseFolders": ["/home/$USER/Documents/Projects/"],
     "projectManager.git.maxDepthRecursion": 6,
     "projectManager.hg.maxDepthRecursion": 6,
     "projectManager.supportSymlinksOnBaseFolders": true,
     "projectManager.svn.maxDepthRecursion": 6,
     "projectManager.tags": [
       "Local",
       "Github",
       "Gitlab",
       "Poliglotus",
       "Pepperstone"
     ],
     "projectManager.vscode.maxDepthRecursion": 6,

     // =========================
     // Python
     // =========================
     "python.analysis.diagnosticMode": "openFilesOnly",
     "python.analysis.typeCheckingMode": "basic",
     "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
     "python.terminal.activateEnvironment": true,

     // =========================
     // Ruff
     // =========================
     "ruff.configurationPreference": "editorFirst",
     "ruff.exclude": [
       "/home/$USER/Documents/Projects/gitlab/GnuGorets/dotfiles/laptop/t480/dotfiles/qtile/.config/qtile/config.py",
       "/home/$USER/dotfiles/qtile/.config/qtile/config.py"
     ],
     "ruff.importStrategy": "fromEnvironment",
     "ruff.lineLength": 95,
     "ruff.lint.enable": true,
     "ruff.lint.select": ["E", "F", "I", "UP", "B", "SIM", "RUF"],
     "ruff.nativeServer": "auto",

     // =========================
     // Telemetry
     // =========================
     "redhat.telemetry.enabled": false,

     // =========================
     // Terminal / Output font sizes
     // =========================
     "debug.console.fontSize": 12,
     "markdown.preview.fontSize": 12,
     "terminal.integrated.env.linux": {},
     "terminal.integrated.fontSize": 12,
     "terminal.integrated.initialHint": false,
     "terminal.integrated.scrollback": 30000,

     // =========================
     // Terragrunt: hclfmt on save (only terragrunt.hcl)
     // =========================
     "emeraldwalk.runonsave": {
       "commands": [
         {
           "match": "terragrunt\\.hcl$",
           "cmd": "terragrunt hclfmt --terragrunt-working-dir \"${fileDirname}\""
         }
       ]
     },

     // =========================
     // UI / Workbench
     // =========================
     "window.commandCenter": false,
     "workbench.activityBar.location": "bottom",
     "workbench.colorTheme": "Godot 4",
     "workbench.editor.enablePreview": false,
     "workbench.editor.pinnedTabSizing": "compact",
     "workbench.editor.pinnedTabsOnSeparateRow": true,
     "workbench.iconTheme": "material-icon-theme",
     "workbench.remoteIndicator.showExtensionRecommendations": false,
     "workbench.secondarySideBar.showLabels": false,
     "workbench.startupEditor": "none",

     // =========================
     // Spell checker
     // =========================
     "cSpell.language": "ru,en-US"
   }
   ```

5. Add settings.json to default user - ~/.config/VSCodium/User/settings.json

   ```json
   {
     "window.customTitleBarVisibility": "auto",
     "workbench.trustedDomains.promptInTrustedWorkspace": true,
     "chat.editing.confirmEditRequestRemoval": false,
     "chat.editing.confirmEditRequestRetry": false,
     "window.menuBarVisibility": "classic",
     "security.workspace.trust.untrustedFiles": "open",
     "security.workspace.trust.enabled": false,
     "window.restoreWindows": "preserve"
   }
   ```

6. Install apps on OS-level via uv

   ```zsh
   for p in ruff ansible-lint yamllint pre-commit; do
   uv tool install "$p"
   done
   ```

7. Install apps from [packages.txt](./../packages.txt) on OS-level
