# T480

Arch Linux laptop setup, recovery and dotfiles notes.

## AI

- **Agents:** `pohuy`, `systematic-debugging`, `find-skills` in `.agents/`.
- **VSCodium:** OpenAI ChatGPT/Codex (`openai.chatgpt`), Copilot, Claude Code and agent skills; Ruff, Pylance, Prettier, Terraform, Helm and Ansible tooling.

## Terminal / Workflow

- **agterm:** Codex/Pi status; split, scratch, Yazi, revdiff and hotkey overlays.
- **zsh:** main shell, aliases, plugins and portable `$HOME` paths.
- **Zellij:** modal keybinds, pane/tab navigation, floating panes and work layout.
- **Yazi, Alacritty, btop, cheat, direnv, fastfetch.**
- Helpers: `pacui.sh`, `translate.sh`, `zellij-open.sh`.

## Desktop / Apps

- **Qtile:** modular config, autostart, status, power, Bluetooth and Rofi scripts; power menu uses `lockscreen`.
- **i3lock:** official X11 locker with ImageMagick-generated dimmed and blurred wallpaper.
- **Rofi, Picom, Dunst, Tint2:** launcher, compositor, notifications and tray.
- **GTK/Kvantum/fontconfig:** Qogir theme, Qt theme and fonts.
- **Satty/Viewnior:** screenshots and image viewing.
- X11 input, MIME associations, wallpapers and Xresources.
- **Neovim, VSCodium, Docker Compose, yay, mpv/SponsorBlock, Forkgram, Parcellite.**

## Install / Restore

1. Install Arch Linux.
2. Install `mesa` for UHD 630, VirtualBox, `i3lock`, ImageMagick and Bluetooth.
3. Review all packages in [`packages.txt`](packages.txt).
4. For VirtualBox: `_ usermod -a -G vboxusers $USER`.
5. Restore the `etc` directory and the SDDM theme to `/usr/share/sddm/themes`.

## System Configuration

### TLP / Trim

Enable TLP:

```zsh
_ systemctl enable tlp.service && _ systemctl start tlp.service && _ tlp start
```

Restore `/etc/tlp.d/01-battery.conf`:

```ini
# Battery charge thresholds for ThinkPad
START_CHARGE_THRESH_BAT0=40
STOP_CHARGE_THRESH_BAT0=80
RESTORE_THRESHOLDS_ON_BAT=1
```

Enable trim: `_ systemctl enable fstrim.timer`.

### Makepkg / Applications

- Add `!` before `debug` in the `OPTIONS` line of `/etc/makepkg.conf`; clean `~/.cache/yay` to disable AUR debug packages.
- Add `Hidden=true` to selected desktop files in `/usr/share/applications`.
- Remove unnecessary Rofi shortcuts from `/usr/share/applications`.

### GRUB / SDDM

- Update `/boot/grub/grub.cfg`, `/etc/os-release` and `/etc/lsb-release` for Arch.
- Remove obsolete hooks:

  ```zsh
  _ rm /etc/pacman.d/hooks/{lsb-release.hook,os-release.hook,issue.hook}
  ```

- Restore the GRUB theme and SDDM theme.

### Lockscreen

- `lockscreen` runs `/usr/bin/i3lock` with `~/.cache/lockscreen/dimblur.png`.
- `lockscreen-update` generates wallpaper from `/usr/share/wall/pixel_sakura.png` at 40% dim and blur level 1.
- Scripts: `bin/.bin/lockscreen` and `bin/.bin/lockscreen-update`; link both into `~/.bin`.
- PAM uses `/etc/pam.d/i3lock` and system `pam_faillock` settings.

## User Services

```zsh
stow systemd
systemctl --user enable ssh-agent.service
systemctl --user start ssh-agent.service
systemctl --user start syncthing.service
systemctl --user enable syncthing.service
```

Configured services: `ssh-agent.service` and `syncthing.service`.

## Other Setup

- List explicitly installed packages: `yay -Qeq | sort > packages.txt`.

### CLI tools

#### Go

Export installed Go tools to manifest:

```zsh
gup export --file="gup.json"
```

#### Rust

Install `opio` for a specific version:

```zsh
cargo install --git https://github.com/imf4ll/opio.git
```

- Translation workflow: `translate-shell`, `zenity`, `xclip` and `translate.sh`; RU translation: `Ctrl+Super+T`.
- Set TTL and reboot:

  ```zsh
  echo "net.ipv4.ip_default_ttl=65" | _ tee -a /etc/sysctl.d/99-sysctl.conf
  _ reboot
  ```

### Extra HDD Permissions

1. Add to `/etc/fstab`: `UUID=value /path ext4 (or other fs) noatime,rw 0`.
2. `_ chown -R user:group /path`.
3. `_ chmod 775 /path`.

### Tor

- Configure Tor bridges: <https://ctlos.github.io/wiki/packages/other-pkg/#мосты-tor>.

## Cleanup

- Delete `~/.bin/multilock.sh`.
- Remove old GTK themes: `_ rm -rf /usr/share/themes/ctlos-*`.
- Remove `GTK_THEME` from `/etc/environment`: `_ sed -i '/GTK_THEME/d' /etc/environment`.
- Remove orphan packages:

  ```zsh
  yay -Qtdq | yay -Rns -
  yay -Qqd | yay -Rsu --print -
  ```

## Dotfiles Recovery

```zsh
cd ~/dotfiles/laptop/t480/dotfiles
stow zsh agterm agents zellij qtile git
```

Install other packages as needed. Remove links with `stow -D <package>`.
Do not restore secrets, sessions, `node_modules`, caches or backup files.
