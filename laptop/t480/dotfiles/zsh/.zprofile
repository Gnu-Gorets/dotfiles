# User/local bins + rofi scripts first
export PATH=$HOME/.bin:$HOME/.config/rofi/scripts:$HOME/.local/bin:/usr/local/bin:$PATH

# Terminal + XDG base dirs
export TERM="xterm-256color"
export XDG_CONFIG_HOME="$HOME/.config"

# WM/renderer quirks
export _JAVA_AWT_WM_NONREPARENTING=1
export CHROMIUM_FLAGS="--use-gl=desktop"

# Default apps + locale
export EDITOR=nvim
export BROWSER="librewolf"
export LANG=en_US.UTF-8

# direnv (quiet + allow home)
export DIRENV_ALLOW_HOME=true
export DIRENV_LOG_FORMAT=""

# SSH agent socket from systemd user service
export SSH_AUTH_SOCK="$XDG_RUNTIME_DIR/ssh-agent.socket"

# Convenience alias target for sudo bin
export SUDOBIN=sudo

# terragrunt/terraform env
export TG_TF_FORWARD_STDOUT=true
export TG_LOG_LEVEL=WARN
