# Security

- Wrappers spawn the embedded executable with argv arrays.
- Wrappers do not use shell interpolation for user paths.
- Workspace paths are resolved, realpathed, and confined before use.
- Runtime digest verification is mandatory before launch.
- Runtime Sigstore verification is attempted when `cosign` is available unless
  disabled by `--no-signature-check`.
- Markdown code, MDX JavaScript, R chunks, Pandoc filters, and renderer hooks
  are never executed.
- Default output redacts document contents, raw config values, environment
  variables, credentials, and absolute private paths.
