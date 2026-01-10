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
     // UI / Workbench
     // =========================
     "workbench.activityBar.location": "bottom",
     "workbench.startupEditor": "none",
     "workbench.colorTheme": "Godot 4",
     "workbench.iconTheme": "material-icon-theme",
     "workbench.editor.enablePreview": false,
     "workbench.editor.pinnedTabSizing": "compact",
     "workbench.editor.pinnedTabsOnSeparateRow": true,
     "workbench.secondarySideBar.showLabels": false,
     "window.commandCenter": false,
     "chat.commandCenter.enabled": false,

     // =========================
     // Telemetry
     // =========================
     "redhat.telemetry.enabled": false,

     // =========================
     // Editor: common behavior
     // =========================
     "editor.minimap.enabled": false,
     "editor.wordWrap": "on",
     "editor.rulers": [80, 95, 110],

     "editor.tabSize": 2,
     "editor.insertSpaces": true,

     "editor.fontLigatures": false,
     "editor.fontSize": 13,

     // Keep VS Code responsive on huge files
     "editor.largeFileOptimizations": true,

     // =========================
     // Diff editor
     // =========================
     "diffEditor.ignoreTrimWhitespace": true,
     "diffEditor.maxComputationTime": 5000,

     // =========================
     // Formatting (global)
     // =========================
     "editor.formatOnSave": true,
     "editor.formatOnSaveMode": "file",

     // Default formatter for languages without explicit overrides
     "editor.defaultFormatter": "esbenp.prettier-vscode",

     // =========================
     // Files: whitespace / EOL hygiene
     // =========================
     "files.trimTrailingWhitespace": true,
     "files.insertFinalNewline": true,
     "files.trimFinalNewlines": true,
     "files.eol": "\n",

     // =========================
     // JSON / YAML / Markdown: Prettier
     // =========================
     "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[jsonc]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[yaml]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
     "[markdown]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },

     // =========================
     // Terraform: terraform fmt
     // =========================
     "[terraform]": {
       "editor.defaultFormatter": "hashicorp.terraform",
       "editor.formatOnSave": true
     },
     "[terraform-vars]": {
       "editor.defaultFormatter": "hashicorp.terraform",
       "editor.formatOnSave": true
     },

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
     // Helm templates: treat as Helm (avoid formatting templates)
     // =========================
     "files.associations": {
       "**/templates/*.yml": "helm",
       "**/templates/*.yaml": "helm",
       "**/*.tpl": "helm",
       "**/*.gotmpl": "helm"
     },
     "[helm]": { "editor.formatOnSave": false },

     // =========================
     // Python: Ruff format + fixes + imports
     // =========================
     "[python]": {
       "editor.tabSize": 4,
       "editor.insertSpaces": true,
       "editor.defaultFormatter": "charliermarsh.ruff",
       "editor.formatOnSave": true,
       "editor.codeActionsOnSave": {
         "source.fixAll.ruff": "explicit",
         "source.organizeImports.ruff": "explicit"
       }
     },

     // Python analysis: useful signal without scanning the entire repo
     "python.analysis.typeCheckingMode": "basic",
     "python.analysis.diagnosticMode": "openFilesOnly",

     // Default interpreter for repos that keep venv in .venv/
     "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
     "python.terminal.activateEnvironment": true,

     // =========================
     // Ruff: global policy (editor-level)
     // =========================
     "ruff.importStrategy": "fromEnvironment",
     "ruff.lint.enable": true,
     "ruff.nativeServer": "auto",
     "ruff.lineLength": 95,
     "ruff.lint.select": ["E", "F", "I", "UP", "B", "SIM", "RUF"],
     "ruff.exclude": ["/home/$USER$/dotfiles/qtile/.config/qtile/config.py"],
     "ruff.configurationPreference": "editorFirst",

     // =========================
     // Global code actions on save (keep explicit to avoid surprise edits)
     // =========================
     "editor.codeActionsOnSave": {
       "source.fixAll": "explicit",
       "source.organizeImports": "explicit"
     },

     // =========================
     // Ansible: lint integration (format handled by YAML/Prettier)
     // =========================
     "ansible.validation.lint.enabled": true,
     "ansible.validation.lint.path": "ansible-lint",

     // =========================
     // Docker Compose (YAML-like): keep consistent with Prettier
     // =========================
     "[dockercompose]": {
       "editor.tabSize": 2,
       "editor.insertSpaces": true,
       "editor.autoIndent": "advanced",
       "editor.quickSuggestions": {
         "other": true,
         "comments": false,
         "strings": true
       },
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },

     // =========================
     // Git / SCM
     // =========================
     "git.autofetch": "all",
     "git.confirmSync": false,
     "git.replaceTagsWhenPull": true,
     "git.repositoryScanMaxDepth": 6,
     "git.ignoreRebaseWarning": true,
     "scm.alwaysShowRepositories": true,
     "scm.defaultViewSortKey": "name",
     "scm.inputFontSize": 12,

     // =========================
     // Git Graph (if extension installed)
     // =========================
     "git-graph.date.format": "ISO Date & Time",
     "git-graph.commitDetailsView.fileView.type": "File List",
     "git-graph.contextMenuActionsVisibility": {},

     // =========================
     // GitHub / PRs / Copilot
     // =========================
     "githubPullRequests.pullBranch": "never",
     "github.copilot.nextEditSuggestions.enabled": false,
     "github.copilot.enable": {
       "*": true,
       "plaintext": false,
       "markdown": true,
       "yaml": true,
       "json": true
     },

     // =========================
     // Terminal
     // =========================
     "terminal.integrated.fontSize": 12,
     "terminal.integrated.scrollback": 30000,
     "terminal.integrated.env.linux": {},

     // =========================
     // Chat / Inline Chat
     // =========================
     "chat.disableAIFeatures": false,
     "debug.console.fontSize": 12,
     "chat.editor.fontSize": 12,
     "markdown.preview.fontSize": 12,
     "chat.mcp.access": "none",
     "chat.viewSessions.orientation": "auto",
     "chat.viewWelcome.enabled": false,
     "inlineChat.holdToSpeech": false,

     // =========================
     // Accessibility
     // =========================
     "accessibility.verbosity.inlineChat": false,
     "accessibility.verbosity.panelChat": false,

     // =========================
     // Project Manager
     // =========================
     "projectManager.git.baseFolders": ["/home/$USER/Documents/Projects/"],
     "projectManager.supportSymlinksOnBaseFolders": true,
     "projectManager.git.maxDepthRecursion": 6,
     "projectManager.any.maxDepthRecursion": 6,
     "projectManager.hg.maxDepthRecursion": 6,
     "projectManager.svn.maxDepthRecursion": 6,
     "projectManager.vscode.maxDepthRecursion": 6,
     "projectManager.tags": [
       "Local",
       "Github",
       "Gitlab",
       "Poliglotus",
       "Pepperstone"
     ],

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
