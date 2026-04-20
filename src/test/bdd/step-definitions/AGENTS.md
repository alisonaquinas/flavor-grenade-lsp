# AGENTS.md — src/test/bdd/step-definitions/

## Purpose

Implements all Cucumber step definitions. One file per feature area keeps
steps discoverable and avoids cross-contamination of unrelated assertions.

## Layout

```
step-definitions/
├── hooks.ts                  # Before/After — world lifecycle
├── common.steps.ts           # cross-feature shared steps
├── transport.steps.ts
├── wiki-links.steps.ts
├── block-references.steps.ts
├── callouts.steps.ts
├── code-actions.steps.ts
├── completions.steps.ts
├── diagnostics.steps.ts
├── embeds.steps.ts
├── frontmatter.steps.ts
├── navigation.steps.ts
├── rename.steps.ts
├── tags.steps.ts
└── vault-detection.steps.ts
```

## Invariants

- Step definitions must import response types from `../lsp-types.ts`. Using
  `any` casts for LSP response shapes is not permitted.
- `this` in every step function is typed as `FGWorld`. Never access world
  properties via untyped `this`.
- Steps that start the server call `this.startServer(this.vaultUri())` if
  `!this.proc` — they must check before starting to avoid double-starting.
- Steps that need to open a document before making a request must call
  `this.openDocumentWithText(uri, content)` first.

## Workflows

- **Adding a step for an existing feature**: add it to the matching
  `*.steps.ts` file. If the pattern conflicts with a Cucumber expression in
  another file, use a regex pattern instead.
- **Adding a step for a new feature**: create a new `*.steps.ts` file and
  import it — Cucumber auto-discovers all files matched by `cucumber.yaml`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../../AGENTS.md)
