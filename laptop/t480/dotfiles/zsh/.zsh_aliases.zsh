alias la="ls -alFh --color=auto"
alias duh="du -d 1 -h | sort -h"

alias srm="sudo rm -rfv"
alias rm="rm -rfv"
alias mk="mkdir"
alias free='free -h'

alias sz="source $HOME/.zshrc"
alias saz="source $HOME/.zsh_aliases.zsh"
alias vga="lspci -k | grep -A 2 -E '(VGA|3D)'"
alias upgrub="sudo grub-mkconfig -o /boot/grub/grub.cfg"

alias iip="curl --max-time 10 -w '\n' http://ident.me"
alias tb="nc termbin.com 9999"
alias tbc="nc termbin.com 9999 | xsel -b -i"
alias speed="curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python -"

alias zellij-clean="zellij kill-all-sessions --yes && zellij delete-all-sessions --yes"

alias y="yay -S"
alias yrsn="yay -Rsn"
alias yu="yay -Syyu"
