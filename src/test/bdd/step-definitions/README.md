# step-definitions/

Cucumber step definition files — one file per BDD feature area.

Each file implements the Given/When/Then steps for the corresponding
`.feature` file in `docs/bdd/features/`.

## Files

| File                        | Feature area                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `common.steps.ts`           | Shared steps used across multiple features (vault setup, document open, diagnostics, completion assertions) |
| `transport.steps.ts`        | Initialize/shutdown handshake and lifecycle sequence                                                        |
| `wiki-links.steps.ts`       | Wiki-link definition resolution and related-information assertions                                          |
| `block-references.steps.ts` | Block anchor (`^id`) definition and reference resolution                                                    |
| `callouts.steps.ts`         | Callout parsing assertions and completion                                                                   |
| `code-actions.steps.ts`     | Code action availability and result assertions                                                              |
| `completions.steps.ts`      | Completion item assertions                                                                                  |
| `diagnostics.steps.ts`      | Diagnostic code and message assertions                                                                      |
| `embeds.steps.ts`           | Embed (`![[…]]`) definition resolution                                                                      |
| `frontmatter.steps.ts`      | YAML frontmatter parsing and field assertions                                                               |
| `navigation.steps.ts`       | Code lens, document highlight, and back-link assertions                                                     |
| `rename.steps.ts`           | PrepareRename and rename WorkspaceEdit assertions                                                           |
| `tags.steps.ts`             | Tag registry and references assertions                                                                      |
| `vault-detection.steps.ts`  | Vault mode detection assertions                                                                             |
| `hooks.ts`                  | Cucumber `Before`/`After` hooks — creates and tears down `FGWorld` per scenario                             |
