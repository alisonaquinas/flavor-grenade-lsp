---
title: Unit Tests — Config Module
tags: [test/unit, test/tdd, module/config]
aliases: [Unit Tests Config, ConfigModule Tests]
---

> [!INFO] ConfigModule reads .flavor-grenade.toml and merges with defaults. Tests use in-memory TOML strings (no real disk I/O) via a mock TomlReader interface injected into TomlLoader.

See [[architecture/layers]] for where ConfigModule sits in the dependency graph and [[adr/ADR010-tests-directory-structure]] for the spec file layout convention.

---

## TC-UNIT-CFG-001 — TomlLoader: returns typed FlavorConfig for a valid TOML string

**Class / Service:** `TomlLoader`
**Spec file:** `tests/unit/config/TomlLoader.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('parses a valid TOML string into a typed FlavorConfig', () => {
  const toml = `
    [completion]
    candidates = 10

    [callouts]
    customTypes = ["note", "tip"]
  `
  const reader: TomlReader = { read: (_path) => toml }
  const loader = new TomlLoader(reader)
  const config = loader.load('/any/path/.flavor-grenade.toml')

  expect(config.completion.candidates).toBe(10)
  expect(config.callouts.customTypes).toEqual(['note', 'tip'])
})
```

**GREEN — Implementation satisfies when:**

- `TomlLoader.load` calls the injected `TomlReader`, passes the resulting string to the TOML parser, and maps the parsed object onto the `FlavorConfig` type

---

## TC-UNIT-CFG-002 — TomlLoader: returns default config when the file is missing

**Class / Service:** `TomlLoader`
**Spec file:** `tests/unit/config/TomlLoader.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns the default config without throwing when the file does not exist', () => {
  const reader: TomlReader = { read: (_path) => null }
  const loader = new TomlLoader(reader)
  const config = loader.load('/nonexistent/.flavor-grenade.toml')

  expect(config).toEqual(DEFAULT_FLAVOR_CONFIG)
})
```

**GREEN — Implementation satisfies when:**

- When the reader returns `null` (signalling a missing file), `TomlLoader.load` returns `DEFAULT_FLAVOR_CONFIG` instead of propagating any error

---

## TC-UNIT-CFG-003 — TomlLoader: throws ConfigParseError for invalid TOML syntax

**Class / Service:** `TomlLoader`
**Spec file:** `tests/unit/config/TomlLoader.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws ConfigParseError when the TOML string is syntactically invalid', () => {
  const reader: TomlReader = { read: (_path) => '[[not valid toml =' }
  const loader = new TomlLoader(reader)

  expect(() => loader.load('/path/.flavor-grenade.toml')).toThrow(ConfigParseError)
})
```

**GREEN — Implementation satisfies when:**

- Any TOML parser exception is caught and re-thrown as a `ConfigParseError` with a message that includes the file path

---

## TC-UNIT-CFG-004 — TomlLoader: ignores unknown keys (forward compatibility)

**Class / Service:** `TomlLoader`
**Spec file:** `tests/unit/config/TomlLoader.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('ignores unknown keys and still parses known fields', () => {
  const toml = `
    [completion]
    candidates = 5
    futureOption = "ignored"

    [unknownSection]
    foo = "bar"
  `
  const reader: TomlReader = { read: (_path) => toml }
  const loader = new TomlLoader(reader)
  const config = loader.load('/path/.flavor-grenade.toml')

  expect(config.completion.candidates).toBe(5)
  expect((config as any).unknownSection).toBeUndefined()
})
```

**GREEN — Implementation satisfies when:**

- Unknown top-level sections and unknown keys within known sections are silently dropped; the typed config only contains known fields

---

## TC-UNIT-CFG-005 — TomlLoader: merges partial config with defaults

**Class / Service:** `TomlLoader`
**Spec file:** `tests/unit/config/TomlLoader.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('fills in missing keys from defaults when only a subset is specified', () => {
  const toml = `
    [completion]
    candidates = 3
  `
  const reader: TomlReader = { read: (_path) => toml }
  const loader = new TomlLoader(reader)
  const config = loader.load('/path/.flavor-grenade.toml')

  expect(config.completion.candidates).toBe(3)
  expect(config.callouts.customTypes).toEqual(DEFAULT_FLAVOR_CONFIG.callouts.customTypes)
})
```

**GREEN — Implementation satisfies when:**

- The loaded config is deep-merged with `DEFAULT_FLAVOR_CONFIG` so that unspecified sections and keys retain their default values

---

## TC-UNIT-CFG-006 — ConfigCascade: single config resolves to its own values

**Class / Service:** `ConfigCascade`
**Spec file:** `tests/unit/config/ConfigCascade.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns the single config unchanged when only one source is provided', () => {
  const config: FlavorConfig = {
    ...DEFAULT_FLAVOR_CONFIG,
    completion: { candidates: 7 },
  }
  const cascade = new ConfigCascade([config])
  expect(cascade.resolve().completion.candidates).toBe(7)
})
```

**GREEN — Implementation satisfies when:**

- `ConfigCascade.resolve` with a single-element list returns that element's values (merged over defaults)

---

## TC-UNIT-CFG-007 — ConfigCascade: closer config wins on conflicting keys

**Class / Service:** `ConfigCascade`
**Spec file:** `tests/unit/config/ConfigCascade.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('gives precedence to the first (closer) config over the second on conflicting keys', () => {
  const closer: FlavorConfig = {
    ...DEFAULT_FLAVOR_CONFIG,
    completion: { candidates: 12 },
  }
  const further: FlavorConfig = {
    ...DEFAULT_FLAVOR_CONFIG,
    completion: { candidates: 3 },
  }
  // Convention: index 0 = closest to document, last = furthest (global)
  const cascade = new ConfigCascade([closer, further])
  expect(cascade.resolve().completion.candidates).toBe(12)
})
```

**GREEN — Implementation satisfies when:**

- The merge strategy iterates from furthest to closest, so earlier entries (closer to the document) always win

---

## TC-UNIT-CFG-008 — ConfigCascade: no configs present returns global defaults

**Class / Service:** `ConfigCascade`
**Spec file:** `tests/unit/config/ConfigCascade.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('returns DEFAULT_FLAVOR_CONFIG when the cascade list is empty', () => {
  const cascade = new ConfigCascade([])
  expect(cascade.resolve()).toEqual(DEFAULT_FLAVOR_CONFIG)
})
```

**GREEN — Implementation satisfies when:**

- An empty cascade does not throw and falls back entirely to `DEFAULT_FLAVOR_CONFIG`

---

## TC-UNIT-CFG-009 — ConfigCascade: partial override in closer file preserves further-file values

**Class / Service:** `ConfigCascade`
**Spec file:** `tests/unit/config/ConfigCascade.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('preserves further-file values for keys not overridden by the closer file', () => {
  const closer: FlavorConfig = {
    ...DEFAULT_FLAVOR_CONFIG,
    completion: { candidates: 8 },
    // callouts not specified
  }
  const further: FlavorConfig = {
    ...DEFAULT_FLAVOR_CONFIG,
    callouts: { customTypes: ['warning', 'danger'] },
  }
  const cascade = new ConfigCascade([closer, further])
  const resolved = cascade.resolve()

  expect(resolved.completion.candidates).toBe(8)
  expect(resolved.callouts.customTypes).toEqual(['warning', 'danger'])
})
```

**GREEN — Implementation satisfies when:**

- Merging is done per-key (deep merge), not per-config-object; a closer file that omits a section does not erase that section from a further file

---

## TC-UNIT-CFG-010 — FlavorConfig schema: rejects non-positive integer for candidates

**Class / Service:** `FlavorConfig`
**Spec file:** `tests/unit/config/FlavorConfig.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws a validation error when completion.candidates is zero', () => {
  expect(() => validateFlavorConfig({ completion: { candidates: 0 } })).toThrow()
})

it('throws a validation error when completion.candidates is negative', () => {
  expect(() => validateFlavorConfig({ completion: { candidates: -5 } })).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- `validateFlavorConfig` (or the schema parser) enforces `candidates >= 1` with a descriptive error message identifying the field name

**REFACTOR notes:** These two cases may be collapsed into a single parameterised test using `it.each`.

---

## TC-UNIT-CFG-011 — FlavorConfig schema: rejects non-string-array for customTypes

**Class / Service:** `FlavorConfig`
**Spec file:** `tests/unit/config/FlavorConfig.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('throws when callouts.customTypes contains a non-string element', () => {
  expect(() =>
    validateFlavorConfig({ callouts: { customTypes: ['valid', 42 as any] } })
  ).toThrow()
})

it('throws when callouts.customTypes is not an array', () => {
  expect(() =>
    validateFlavorConfig({ callouts: { customTypes: 'not-an-array' as any } })
  ).toThrow()
})
```

**GREEN — Implementation satisfies when:**

- Schema validation inspects each element of `customTypes` and rejects anything that is not a plain string; non-array values are also rejected

---

## TC-UNIT-CFG-012 — FlavorConfig schema: accepts a valid minimal config

**Class / Service:** `FlavorConfig`
**Spec file:** `tests/unit/config/FlavorConfig.spec.ts`
**Linked FR:** —
**Type:** Scripted (Bun test runner)

**RED — Failing test:**

```typescript
it('accepts a minimal valid config without throwing', () => {
  const minimal = {
    completion: { candidates: 1 },
    callouts: { customTypes: [] },
  }
  expect(() => validateFlavorConfig(minimal)).not.toThrow()
  const result = validateFlavorConfig(minimal)
  expect(result.completion.candidates).toBe(1)
})
```

**GREEN — Implementation satisfies when:**

- `validateFlavorConfig` returns the typed `FlavorConfig` object when all required fields are present and valid, with no extraneous mutation of values
