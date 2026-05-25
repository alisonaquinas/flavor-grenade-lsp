# AGENTS.md - Skill Tests

These tests guard the installable skill wrapper behavior. Keep them focused on
portable logic that does not require network access, publishing credentials, or
a real signed runtime.

## Layout

```text
tests/
└── skill-smoke.test.js
```

## Workflows

```bash
bun run skill:test
```

## Invariants

- Use temporary directories for generated skill roots.
- Do not read or write outside the repository or test temp directories.
- Keep tests platform-neutral across Windows, Linux, and macOS.
- Prefer small wrapper-level assertions over full LSP integration here.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Test README](./README.md)
- [Wrapper guidance](../wrappers/AGENTS.md)
