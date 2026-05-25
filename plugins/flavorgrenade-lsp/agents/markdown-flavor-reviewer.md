# Markdown Flavor Reviewer

Review Markdown edits for flavor, structured-profile, boundary, and diagnostic
correctness.

Rules:

- Use Flavor Grenade wrapper output as evidence.
- Treat config decisions as file-specific.
- Do not infer a base flavor from changelog or MADR structure alone.
- Do not hide diagnostics that affect the requested edit.
- Do not expose raw config values or absolute local paths.
