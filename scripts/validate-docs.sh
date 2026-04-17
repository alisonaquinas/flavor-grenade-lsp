#!/usr/bin/env bash
# validate-docs.sh — Run only the Markdown linters.
#
# Useful for doc-only changes where running the full TypeScript toolchain
# would be unnecessary overhead.
#
# Usage: ./scripts/validate-docs.sh
#
# Linters run:
#   1. markdownlint-obsidian — docs/ (enforces Obsidian-specific Markdown rules)
#   2. markdownlint-cli2     — all other .md files (root, .github/, scripts/)
#
# Exit code: 0 if both linters pass, 1 if either fails.

set -uo pipefail
# Note: -e is intentionally omitted so both linters always run and the summary
# can report results for both even if the first one fails.

# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------

if [[ -t 1 ]] && command -v tput &>/dev/null; then
  GREEN="$(tput setaf 2)"
  RED="$(tput setaf 1)"
  RESET="$(tput sgr0)"
  BOLD="$(tput bold)"
else
  GREEN=""
  RED=""
  RESET=""
  BOLD=""
fi

PASS="${GREEN}PASS${RESET}"
FAIL="${RED}FAIL${RESET}"

# ---------------------------------------------------------------------------
# 1. markdownlint-obsidian — docs/
# ---------------------------------------------------------------------------

echo "${BOLD}==> markdownlint-obsidian (docs/)${RESET}"
set +e
bunx markdownlint-obsidian --config .obsidian-linter.jsonc docs/
OBSIDIAN_RESULT=$?
set -e
echo ""

# ---------------------------------------------------------------------------
# 2. markdownlint-cli2 — all other Markdown files
# ---------------------------------------------------------------------------

echo "${BOLD}==> markdownlint-cli2 (other .md files)${RESET}"
set +e
bunx markdownlint-cli2 "**/*.md" "!docs/**" "!.github/**" "!node_modules/**"
CLI2_RESULT=$?
set -e
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "${BOLD}Summary${RESET}"
echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

OVERALL=0

if [[ "$OBSIDIAN_RESULT" -eq 0 ]]; then
  echo "  $PASS  markdownlint-obsidian (docs/)"
else
  echo "  $FAIL  markdownlint-obsidian (docs/)"
  OVERALL=1
fi

if [[ "$CLI2_RESULT" -eq 0 ]]; then
  echo "  $PASS  markdownlint-cli2 (other .md files)"
else
  echo "  $FAIL  markdownlint-cli2 (other .md files)"
  OVERALL=1
fi

echo ""

if [[ "$OVERALL" -eq 0 ]]; then
  echo "${GREEN}All Markdown linters passed.${RESET}"
else
  echo "${RED}One or more Markdown linters failed.${RESET}" >&2
fi

exit $OVERALL
