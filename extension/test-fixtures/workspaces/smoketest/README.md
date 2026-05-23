# Markdown Flavor Smoketest Fixtures

Each child directory is a small workspace fixture with `.flavor-grenade.toml`
declaring one supported Markdown flavor. The extension unit tests read these
fixtures to verify project evidence detection for every explicit flavor.

This root README is a negative control. It should remain generic Markdown and
must not become OFM just because child fixtures contain `.flavor-grenade.toml`.
When manually launching the extension from the repository checkout, use an
isolated temp copy of this folder; otherwise the repository-level
`.flavor-grenade.toml` can be discovered as an ancestor and create a false
positive.

Samples intentionally stay compact. They are for extension smoke coverage, not
full parser conformance; parser conformance lives in server tests.
