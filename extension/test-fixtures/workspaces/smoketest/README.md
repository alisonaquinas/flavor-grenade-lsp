# Markdown Flavor Smoketest Fixtures

Top-level flavor directories are small workspace fixtures with
`.flavor-grenade.toml` declaring one supported Markdown flavor. The extension
unit tests read these fixtures to verify project evidence detection for every
explicit flavor.

The `inference/` directory contains samples with no `.flavor-grenade.toml`.
Those fixtures exist for syntax/context inference smoke tests: Auto Detect
should eventually infer the flavor from strong local syntax when configuration
is absent.

This root README is a negative control. It should remain generic Markdown and
must not become OFM just because child fixtures contain `.flavor-grenade.toml`.
When manually launching the extension from the repository checkout, use an
isolated temp copy of this folder; otherwise the repository-level
`.flavor-grenade.toml` can be discovered as an ancestor and create a false
positive.

Samples intentionally stay compact. They are for extension smoke coverage, not
full parser conformance; parser conformance lives in server tests.
