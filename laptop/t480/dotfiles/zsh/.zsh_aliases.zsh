alias la="ls -alFh --color=auto"
alias duh="du -d 1 -h | sort -h"

alias srm="sudo rm -rfv"
alias rm="rm -rfv"
alias mk="mkdir"
alias free='free -h'
alias df='df -h -x tmpfs -x devtmpfs -x efivarfs'

alias sz="source $HOME/.zshrc"
alias saz="source $HOME/.zsh_aliases.zsh"
alias vga="lspci -k | grep -A 2 -E '(VGA|3D)'"
alias upgrub="sudo grub-mkconfig -o /boot/grub/grub.cfg"

alias iip="curl --max-time 10 -w '\n' http://ident.me"
alias tb="nc termbin.com 9999"
alias tbc="nc termbin.com 9999 | xclip -selection clipboard -i"
alias speed="curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python -"

alias zellij-clean="zellij kill-all-sessions --yes && zellij delete-all-sessions --yes"

alias y="yay -S"
alias yn="yay -S --noconfirm"
alias yrsn="yay -Rsn"
alias yc="yay -Sc"
alias yu="yay -Syyu"

alias ..="cd .."
alias ...="cd ../.."

alias ea="$EDITOR $HOME/.zsh_aliases.zsh"

ex() {
  if [ -f "$1" ]; then
    case "$1" in
      *.tar.bz2)  tar xvjf "$1"    ;;
      *.tar.gz)   tar xvzf "$1"    ;;
      *.tar.xz)   tar xvJf "$1"    ;;
      *.bz2)      bunzip2 "$1"     ;;
      *.rar)      unrar x -ad "$1" ;;
      *.gz)       gunzip "$1"      ;;
      *.tar)      tar xvf "$1"     ;;
      *.tbz2)     tar xvjf "$1"    ;;
      *.tgz)      tar xvzf "$1"    ;;
      *.zip)      unzip "$1"       ;;
      *.7z)       7z x "$1"        ;;
      *.xz)       unxz "$1"        ;;
      *)          echo "ex: '$1' unknown format" ;;
    esac
  else
    echo "'$1' is not a valid file"
  fi
}
