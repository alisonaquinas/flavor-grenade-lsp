# Markdown Flavor Smoketest Fixtures

Each child directory is a small workspace fixture with `.flavor-grenade.toml`
declaring one supported Markdown flavor. The extension unit tests read these
fixtures to verify project evidence detection for every explicit flavor.

Samples intentionally stay compact. They are for extension smoke coverage, not
full parser conformance; parser conformance lives in server tests.
