export const PROJECT_MARKDOWN_CONFIG_FILES = ['.mdfignore', '.mdfattributes'] as const;

export type ProjectMarkdownConfigFile = (typeof PROJECT_MARKDOWN_CONFIG_FILES)[number];
