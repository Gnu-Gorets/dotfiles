# T480

1. install Arch

## SW:

### ADD/RESTORE:
1. mesa-amber # for UHD 630
2. take a look on [all packages](packages.txt)
3. virtualbox: `sudo usermod -a -G vboxusers $USER`
4. betterlockscreen and `systemctl enable betterlockscreen@$USER`
5. [bluetooth](https://ctlos.github.io/wiki/packages/other-pkg/#bluetooth)

### etc
1. restore etc dir
2. add '!' before "debug" in `/etc/makepkg.conf` in "OPTIONS" line and cleaning `~/.cache/yay` # disable debug in AUR
3. setup tlp:  `sudo systemctl enable tlp.service && sudo systemctl start tlp.service && sudo tlp start`
4. set [memlock](https://github.com/paolostivanin/OTPClient/wiki/Secure-Memory-Limitations)
5. add trim support via fstrim.timer systemd `sudo systemctl enable fstrim.timer`
6. Add `Hidden=true` to `/usr/share/applications` to specific programms

## usr
1. Add sddm theme in `/usr/share/sddm/themes`
2. Add gtk theme in `/usr/share/themes`

### Grub
1. Update to Arch in `/boot/grub/grub.cfg`, `/etc/os-release` and `/etc/lsb-release`
2. Delete old scripts: `sudo rm /etc/pacman.d/hooks/{lsb-release.hook,os-release.hook,issue.hook}`
3. Add Grub theme

### Systemd services (Ssh-agent, Syncthing)
1. stow systemd, after `systemctl --user enable ssh-agent.service && systemctl --user start ssh-agent.service`
2. `systemctl --user start syncthing.service && systemctl --user enable syncthing.service`

### Delete:

1. `~/.bin/multilock.sh`
2. unnecessary shortcuts for rofi `/usr/share/applications/`
3. `yay -Qtdq | yay -Rns -`
4. `yay -Qqd | yay -Rsu --print -`

### Other

1. show all packages `yay -Qeq | sort > packages.txt`
2. `cargo install --git https://github.com/imf4ll/opio.git` # AUR helper to install specific version from AUR
3. for translating - translate-shell, zenity, xclip and translate to RU - ctrl+super+t
4. ttl  
   1) `echo "net.ipv4.ip_default_ttl=65" | sudo tee -a /etc/sysctl.d/99-sysctl.conf`
   2) `sudo reboot`
5. permissions on mount hdd  
   1) `/etc/fstab and add - UUID=value /path ext4 (or other fs) noatime,rw 0`  
   2) `sudo chown -R user:group /path`  
   3) `sudo chmod 775 /path`
6. Tor bridges - https://ctlos.github.io/wiki/packages/other-pkg/#мосты-tor
