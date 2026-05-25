# AGENTS.md - Skill Docs

This directory documents the installable skill contract. Keep it aligned with
`manifest.json`, wrapper command behavior, and release packaging.

## Workflows

Run documentation checks from the repository root:

```bash
bun run lint:docs
```

## Invariants

- Do not describe server behavior that the wrapper cannot expose.
- Keep command fields aligned with `wrappers/flavorgrenade.mjs`.
- Keep schema examples aligned with `wrappers/schema.mjs`.
- Use relative links that resolve inside the skill subtree.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Docs README](./README.md)
- [JSON schema](./json-schema.md)
