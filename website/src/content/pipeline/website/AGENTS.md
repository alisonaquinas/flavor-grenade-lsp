# AGENTS.md — website/src/content/pipeline/website/

The website content compiler and generated-module emitter live here.

## Invariants

- Pipeline output must be deterministic from checked-in Markdown and manifests.
- Validation must reject stale generated files.
- Route and navigation output must remain typed and consumable by the static
  Svelte app.

## See Also

- [Parent AGENTS.md](../../AGENTS.md)
- [Root AGENTS.md](../../../../../AGENTS.md)
- [README.md](./README.md)
