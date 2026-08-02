/**
 * The seventeen generated targets, mirroring templates/manifest.json in the
 * theme repo. `file` is the artefact name inside dist/<flavor>/<dir>/.
 * `{flavor}` and `{label}` are substituted per flavour, exactly as the
 * generator does.
 */
export type PortGroup = 'terminal' | 'editor' | 'shell' | 'desktop' | 'web';

export interface Port {
  slug: string;
  name: string;
  group: PortGroup;
  /** One-line description of what the target is. */
  blurb: string;
  /** Path inside dist/, with {flavor} / {label} placeholders. */
  dist: string;
  /** Where the file goes on the user's machine. */
  install: string;
  /** Extra line the user must add, if the app needs one. */
  activate?: string;
  note?: string;
  homepage: string;
  /** The published port repository, once it ships. Absent = still planned. */
  repo?: string;
}

export const GROUP_LABELS: Record<PortGroup, string> = {
  terminal: 'Terminals',
  editor: 'Editors',
  shell: 'Shell & CLI',
  desktop: 'Desktop',
  web: 'Web',
};

export const ports: Port[] = [
  {
    slug: 'kitty',
    name: 'kitty',
    group: 'terminal',
    blurb: 'The GPU-based terminal emulator. Full 16-colour ANSI mapping plus cursor and selection.',
    dist: 'dist/{flavor}/kitty/sp_night_{flavor}.conf',
    install: '~/.config/kitty/sp_night_{flavor}.conf',
    activate: 'include sp_night_{flavor}.conf',
    homepage: 'https://sw.kovidgoyal.net/kitty/',
  },
  {
    slug: 'alacritty',
    name: 'Alacritty',
    group: 'terminal',
    blurb: 'TOML colour scheme for Alacritty, imported from your main config.',
    dist: 'dist/{flavor}/alacritty/sp_night_{flavor}.toml',
    install: '~/.config/alacritty/sp_night_{flavor}.toml',
    activate: 'general.import = ["~/.config/alacritty/sp_night_{flavor}.toml"]',
    homepage: 'https://alacritty.org/',
  },
  {
    slug: 'ghostty',
    name: 'Ghostty',
    group: 'terminal',
    blurb: 'A Ghostty theme file — note the deliberate lack of extension, which Ghostty requires.',
    dist: 'dist/{flavor}/ghostty/sp_night_{flavor}',
    install: '~/.config/ghostty/themes/sp_night_{flavor}',
    activate: 'theme = sp_night_{flavor}',
    homepage: 'https://ghostty.org/',
    repo: 'https://github.com/sp-night/ghostty',
  },
  {
    slug: 'herdr',
    name: 'herdr',
    group: 'terminal',
    blurb: 'Colours for the herdr terminal multiplexer.',
    dist: 'dist/{flavor}/herdr/sp_night_{flavor}.toml',
    install: 'merged into ~/.config/herdr/config.toml',
    note: 'herdr does not read a separate theme file: the generated file is a reference, and the installer writes the [theme] and [theme.custom] blocks into your own config.toml.',
    homepage: 'https://github.com/rogeradas/herdr',
  },
  {
    slug: 'nvim',
    name: 'Neovim',
    group: 'editor',
    blurb: 'A full colorscheme: treesitter groups, LSP diagnostics, git signs and the usual plugin surfaces.',
    dist: 'dist/{flavor}/nvim/colors/sp_night_{flavor}.lua',
    install: '~/.config/nvim/colors/sp_night_{flavor}.lua',
    activate: ':colorscheme sp_night_{flavor}',
    homepage: 'https://neovim.io/',
  },
  {
    slug: 'tmux',
    name: 'tmux',
    group: 'shell',
    blurb: 'Status line, panes, message and copy-mode colours.',
    dist: 'dist/{flavor}/tmux/sp_night_{flavor}.conf',
    install: '~/.config/tmux/sp_night_{flavor}.conf',
    activate: 'source-file ~/.config/tmux/sp_night_{flavor}.conf',
    homepage: 'https://github.com/tmux/tmux',
  },
  {
    slug: 'fish',
    name: 'fish',
    group: 'shell',
    blurb: 'Syntax highlighting and completion pager colours for the fish shell.',
    dist: 'dist/{flavor}/fish/sp_night_{flavor}.fish',
    install: '~/.config/fish/conf.d/sp_night_{flavor}.fish',
    homepage: 'https://fishshell.com/',
  },
  {
    slug: 'starship',
    name: 'Starship',
    group: 'shell',
    blurb: 'A palette block plus module styling for the Starship prompt.',
    dist: 'dist/{flavor}/starship/sp_night_{flavor}.toml',
    install: '~/.config/starship.toml',
    homepage: 'https://starship.rs/',
  },
  {
    slug: 'bat',
    name: 'bat',
    group: 'shell',
    blurb: 'A TextMate theme for bat, the syntax-highlighting cat.',
    dist: 'dist/{flavor}/bat/sp_night_{flavor}.tmTheme',
    install: '~/.config/bat/themes/sp_night_{flavor}.tmTheme',
    activate: 'bat cache --build',
    homepage: 'https://github.com/sharkdp/bat',
  },
  {
    slug: 'eza',
    name: 'eza',
    group: 'shell',
    blurb: 'EZA_COLORS exports for file type, permission and git status columns.',
    dist: 'dist/{flavor}/eza/sp_night_{flavor}.sh',
    install: 'sourced from your shell rc',
    homepage: 'https://eza.rocks/',
    repo: 'https://github.com/sp-night/eza',
  },
  {
    slug: 'waybar',
    name: 'Waybar',
    group: 'desktop',
    blurb: 'A stylesheet for the Wayland status bar, with every module tinted through the role layer.',
    dist: 'dist/{flavor}/waybar/sp_night_{flavor}.css',
    install: '~/.config/waybar/sp_night_{flavor}.css',
    activate: '@import "sp_night_{flavor}.css";',
    homepage: 'https://github.com/Alexays/Waybar',
  },
  {
    slug: 'hyprland',
    name: 'Hyprland',
    group: 'desktop',
    blurb: 'Border, shadow and group colours for the Hyprland compositor.',
    dist: 'dist/{flavor}/hyprland/sp_night_{flavor}.conf',
    install: '~/.config/hypr/sp_night_{flavor}.conf',
    activate: 'source = ~/.config/hypr/sp_night_{flavor}.conf',
    homepage: 'https://hyprland.org/',
  },
  {
    slug: 'gtk',
    name: 'GTK',
    group: 'desktop',
    blurb: 'GTK 3 and 4 colour overrides, using the system accent rather than the signature orange.',
    dist: 'dist/{flavor}/gtk/sp_night_{flavor}.css',
    install: '~/.config/gtk-4.0/gtk.css (and gtk-3.0)',
    note: 'App widgets use ui.accent_alt (blue), never sodio — the signature orange belongs to terminals and bars, not to selection and focus rings.',
    homepage: 'https://www.gtk.org/',
  },
  {
    slug: 'kde',
    name: 'KDE / Qt',
    group: 'desktop',
    blurb: 'A Plasma colour scheme following the Breeze Dark structure, audited pair by pair.',
    dist: 'dist/{flavor}/kde/sp_night_{flavor}.colors',
    install: '~/.local/share/color-schemes/sp_night_{flavor}.colors',
    note: 'The generator re-reads this file after writing it and checks every Foreground×Background pair in every section against 4.5:1 — the KDE output is audited as output, not just as palette.',
    homepage: 'https://kde.org/plasma-desktop/',
  },
  {
    slug: 'noctalia',
    name: 'Noctalia Shell',
    group: 'desktop',
    blurb: 'A palette for Noctalia, which repropagates it to btop, cava, GTK, Ghostty, Qt, lazygit, yazi and more.',
    dist: 'dist/{flavor}/noctalia/{label}.json',
    install: '~/.config/noctalia/palettes/{label}.json',
    activate: 'noctalia msg color-scheme-set custom "{label}"',
    note: 'The format requires a light block; since the theme is dark-only, that block mirrors the dark one, so toggling the shell mode never drops you into someone else’s palette.',
    homepage: 'https://github.com/noctalia-dev/noctalia-shell',
  },
  {
    slug: 'css',
    name: 'CSS',
    group: 'web',
    blurb: 'Custom properties for every palette key and semantic role — the same file this site runs on.',
    dist: 'dist/{flavor}/css/sp_night_{flavor}.css',
    install: 'import into your stylesheet',
    homepage: 'https://developer.mozilla.org/docs/Web/CSS/Using_CSS_custom_properties',
  },
  {
    slug: 'json',
    name: 'JSON',
    group: 'web',
    blurb: 'The flavour as plain data: palette keys, resolved roles and the ANSI mapping.',
    dist: 'dist/{flavor}/json/sp_night_{flavor}.json',
    install: 'consume it from your own tooling',
    homepage: 'https://www.json.org/',
  },
];

export const portsByGroup = (Object.keys(GROUP_LABELS) as PortGroup[]).map((group) => ({
  group,
  label: GROUP_LABELS[group],
  items: ports.filter((p) => p.group === group),
}));

export const port = (slug: string): Port | undefined => ports.find((p) => p.slug === slug);
