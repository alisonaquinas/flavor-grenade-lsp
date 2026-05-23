---
title: Technical Requirements Index
tags:
  - requirements/technical
aliases:
  - Technical Requirements
---

# Technical Requirements

Technical requirements describe internal implementation constraints, quality
rules, parser safety, input validation, and configuration behavior.

Use this folder when a change constrains how the server, extension, or website
must be built rather than what the user directly sees. Examples include module
boundaries, parser safety limits, configuration precedence, dependency metadata,
manifest consistency, and supply-chain visibility.

## Layer Boundary

Technical requirements are implementation contracts. They may mention source
modules, commands, package manifests, and validation scripts when those details
are part of the required engineering control. Product-facing behavior belongs in
[[docs/requirements/functional/index]], and release or CI policy belongs in
[[docs/requirements/operational/index]].

## Maintenance Rules

- Keep technical requirements testable with local commands, CI assertions, or
  targeted unit tests.
- Record package-source and license expectations in the relevant SBOM rather
  than scattering dependency notes across feature docs.
- Keep security parser and input-validation requirements current with
  [[docs/security/dependency-audit-log]] and the CodeQL/SAST workflow gates.
- Update this index when a technical requirement file moves or a new
  engineering control is added.

## Files

| File | Scope |
|---|---|
| [[code-quality]] | SOLID, module boundaries, docstrings, linting, and TDD rules |
| [[configuration]] | Configuration precedence, validation, and failure isolation |
| [[security-input-validation]] | JSON-RPC, payload, position, and prototype-pollution validation |
| [[security-parser-safety]] | Parser ReDoS, timeout, YAML, embed-depth, and vault-size controls |
| [[sbom]] | Server software bill of materials and SBOM release requirements |
