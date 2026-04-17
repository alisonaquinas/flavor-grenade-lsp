#!/usr/bin/env bash
# lint-all.sh — Run all linters sequentially and print a PASS/FAIL summary.
#
# Usage: ./scripts/lint-all.sh
#
# Linters run (in order):
#   1. TypeScript typecheck       (bun run typecheck)
#   2. ESLint                     (bun run lint, --max-warnings 0 enforced by script)
#   3. Prettier format check      (bun run format:check)
#   4. markdownlint-obsidian      (docs/ only)
#   5. markdownlint-cli2          (all other .md files)
#
# Exit code: 0 if all linters pass, 1 if any linter fails.

set -uo pipefail
# Note: -e is intentionally omitted so we can collect all results before
# exiting. Each linter captures its own exit code.

# ---------------------------------------------------------------------------
# Colour helpers (degrade gracefully if terminal does not support colours)
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
# Run a linter and record the result
# ---------------------------------------------------------------------------

# Associative array: linter_name -> exit_code
declare -A RESULTS

run_linter() {
  local name="$1"
  shift
  echo "${BOLD}==> $name${RESET}"
  # Run the command; capture exit code without aborting the script.
  set +e
  "$@"
  local exit_code=$?
  set -e
  RESULTS["$name"]=$exit_code
  echo ""
}

# ---------------------------------------------------------------------------
# 1. TypeScript typecheck
# ---------------------------------------------------------------------------

run_linter "TypeScript typecheck" bun run typecheck

# ---------------------------------------------------------------------------
# 2. ESLint (zero warnings)
#    The package.json lint script should already include --max-warnings 0.
#    We document this expectation here for transparency.
# ---------------------------------------------------------------------------

run_linter "ESLint (zero warnings)" bun run lint

# ---------------------------------------------------------------------------
# 3. Prettier format check
# ---------------------------------------------------------------------------

run_linter "Prettier format check" bun run format:check

# ---------------------------------------------------------------------------
# 4. markdownlint-obsidian — docs/ only
# ---------------------------------------------------------------------------

run_linter "markdownlint-obsidian (docs/)" \
  bunx markdownlint-obsidian --config .obsidian-linter.jsonc docs/

# ---------------------------------------------------------------------------
# 5. markdownlint-cli2 — all other markdown files
# ---------------------------------------------------------------------------

run_linter "markdownlint-cli2 (other .md files)" \
  bunx markdownlint-cli2 "**/*.md" "!docs/**" "!.github/**" "!node_modules/**"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo "${BOLD}Summary${RESET}"
echo "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

OVERALL=0

for name in \
  "TypeScript typecheck" \
  "ESLint (zero warnings)" \
  "Prettier format check" \
  "markdownlint-obsidian (docs/)" \
  "markdownlint-cli2 (other .md files)"; do

  code="${RESULTS[$name]}"
  if [[ "$code" -eq 0 ]]; then
    echo "  $PASS  $name"
  else
    echo "  $FAIL  $name"
    OVERALL=1
  fi
done

echo ""

if [[ "$OVERALL" -eq 0 ]]; then
  echo "${GREEN}All linters passed.${RESET}"
else
  echo "${RED}One or more linters failed.${RESET}" >&2
fi

exit $OVERALL
