export const FLAVOR_GRENADE_PROJECT_CONFIG_FILES = [
  '.flavor-grenade.toml',
  '.flavor-grenade.json',
  '.flavor-grenade.jsonc',
  '.flavor-grenade.yaml',
  '.flavor-grenade.yml',
  '.editorconfig',
] as const;

export const FLAVOR_GRENADE_PROJECT_CONFIG_GLOBS = [
  '**/.flavor-grenade.toml',
  '**/.flavor-grenade.json',
  '**/.flavor-grenade.jsonc',
  '**/.flavor-grenade.yaml',
  '**/.flavor-grenade.yml',
  '**/.editorconfig',
] as const;

export const FLAVOR_GRENADE_EDITORCONFIG_DIRECTIVE_PATTERN =
  /flavor_grenade[._]markdown_/i;
