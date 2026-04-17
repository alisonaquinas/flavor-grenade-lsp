#!/usr/bin/env bash
# update-test-index.sh — Regenerate docs/test/index.md and docs/test/matrix.md
#                        from the test suite.
#
# Usage: ./scripts/update-test-index.sh
#
# Status: STUB — not yet implemented. Prints a message and exits 0.
#         Implementation is planned for Phase 3.
#
# Intended behaviour (once implemented):
#
#   1. Scan tests/ for all *.spec.ts files.
#
#   2. For each spec file, extract the top-level `describe(...)` block name
#      using a simple regex or a lightweight AST walk (ts-morph or Bun's
#      built-in parser). Nested describes are recorded as sub-entries.
#
#   3. Parse each describe block for requirement tags in the format:
#        // @req FG001, FG003
#      or in a JSDoc comment above the describe block:
#        /** @req FG001 FG003 */
#      These tags link test coverage to diagnostic codes / requirement IDs.
#
#   4. Write docs/test/index.md — a flat list of every spec file with its
#      describe names, one entry per file.
#
#   5. Write docs/test/matrix.md — a table mapping requirement IDs (e.g.
#      FG001–FG007, REQ-xxx) to the test files / describe blocks that cover
#      them. Requirements with no coverage are listed with a "NONE" marker.
#
#   6. Exit non-zero if any spec file cannot be parsed, so CI can catch
#      malformed test files early.

set -euo pipefail

echo "TODO: implement test index update"
echo ""
echo "This script will (when implemented):"
echo "  - Scan tests/ for *.spec.ts files"
echo "  - Extract describe block names and @req tags"
echo "  - Write docs/test/index.md  (test file listing)"
echo "  - Write docs/test/matrix.md (requirement -> test coverage matrix)"
echo ""
echo "Planned for Phase 3. Exiting 0 (no-op)."

exit 0
