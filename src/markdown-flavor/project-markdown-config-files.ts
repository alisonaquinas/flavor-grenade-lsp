export const PROJECT_MARKDOWN_CONFIG_FILES = ['.fgignore', '.fgattributes'] as const;

export type ProjectMarkdownConfigFile = (typeof PROJECT_MARKDOWN_CONFIG_FILES)[number];
