# Markdown Flavor Smoketest Fixtures

Top-level flavor directories are small workspace fixtures with Flavor Grenade
project config declaring one supported Markdown flavor. The extension unit tests
read these fixtures to verify project evidence detection for every explicit
flavor.

The `inference/` directory contains samples with no Flavor Grenade project
config marker.
Those fixtures exist for syntax/context inference smoke tests: Auto Detect
should eventually infer the flavor from strong local syntax when configuration
is absent.

This root README is a negative control. It should remain generic Markdown and
must not become OFM just because child fixtures contain project config markers.
When manually launching the extension from the repository checkout, use an
isolated temp copy of this folder; otherwise a repository-level project config
marker can be discovered as an ancestor and create a false positive.

Samples intentionally stay compact. They are for extension smoke coverage, not
full parser conformance; parser conformance lives in server tests.
