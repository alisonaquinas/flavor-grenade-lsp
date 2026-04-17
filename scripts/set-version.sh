#!/usr/bin/env bash
# set-version.sh — Bump the version field in package.json.
#
# Usage:   ./scripts/set-version.sh <new-version>
# Example: ./scripts/set-version.sh 1.2.3
#
# Requirements:
#   - jq must be installed and on PATH
#   - Run from the repository root (package.json must exist at ./package.json)

set -euo pipefail

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

usage() {
  echo "Usage: $0 <new-version>"
  echo "       new-version must be a semver string, e.g. 1.2.3"
  exit 1
}

die() {
  echo "Error: $1" >&2
  exit 1
}

# ---------------------------------------------------------------------------
# Argument validation
# ---------------------------------------------------------------------------

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
fi

if [[ $# -ne 1 ]]; then
  echo "Error: exactly one argument required." >&2
  usage
fi

NEW_VERSION="$1"

# Validate semver pattern: digits.digits.digits (pre-release and build metadata
# are intentionally not supported here; use the full semver if needed).
SEMVER_PATTERN='^[0-9]+\.[0-9]+\.[0-9]+$'
if ! [[ "$NEW_VERSION" =~ $SEMVER_PATTERN ]]; then
  die "Invalid version format '$NEW_VERSION'. Expected X.Y.Z (e.g. 1.2.3)."
fi

# ---------------------------------------------------------------------------
# Dependency check
# ---------------------------------------------------------------------------

if ! command -v jq &>/dev/null; then
  die "jq is not installed. Install it with: brew install jq  or  apt-get install jq"
fi

# ---------------------------------------------------------------------------
# Resolve package.json (must run from repo root)
# ---------------------------------------------------------------------------

PACKAGE_JSON="package.json"

if [[ ! -f "$PACKAGE_JSON" ]]; then
  die "package.json not found. Run this script from the repository root."
fi

# ---------------------------------------------------------------------------
# Read current version and write new version
# ---------------------------------------------------------------------------

OLD_VERSION="$(jq -r '.version' "$PACKAGE_JSON")"

if [[ "$OLD_VERSION" == "null" || -z "$OLD_VERSION" ]]; then
  die "Could not read .version from $PACKAGE_JSON."
fi

# Use a temp file for atomic replacement (avoids truncating the file on error).
TMP_FILE="$(mktemp)"
# Ensure the temp file is cleaned up on exit, even on error.
trap 'rm -f "$TMP_FILE"' EXIT

jq --arg v "$NEW_VERSION" '.version = $v' "$PACKAGE_JSON" > "$TMP_FILE"
mv "$TMP_FILE" "$PACKAGE_JSON"

echo "Version updated: $OLD_VERSION -> $NEW_VERSION"
