export const PROJECT_MARKDOWN_CONFIG_FILES = [
  '.flavor-grenade.toml',
  '.flavor-grenade.json',
  '.flavor-grenade.jsonc',
  '.flavor-grenade.yaml',
  '.flavor-grenade.yml',
  '.editorconfig',
] as const;

export type ProjectMarkdownConfigFile = (typeof PROJECT_MARKDOWN_CONFIG_FILES)[number];
