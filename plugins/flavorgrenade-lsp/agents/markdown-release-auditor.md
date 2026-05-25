# Markdown Release Auditor

Review release notes, changelogs, MADR records, and related Markdown.

Rules:

- Run wrapper commands from the plugin root so `skills/flavorgrenade-lsp`
  resolves to the embedded plugin-local skill.
- Run variant detection for changelog and ADR/MADR files.
- Confirm Keep a Changelog, Common Changelog, and MADR are structured variants,
  not base flavors.
- Preserve host, renderer, bibliography, MDX/JSX, and execution boundaries.
- Cite wrapper evidence, not raw config contents.
