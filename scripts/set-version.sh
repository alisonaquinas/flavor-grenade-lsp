#!/usr/bin/env bash
# set-version.sh — Bump linked package versions.
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
# Resolve package manifests (must run from repo root)
# ---------------------------------------------------------------------------

PACKAGE_JSON="package.json"
MARKDOWN_FLAVOR_PACKAGE_JSON="packages/markdown-flavor/package.json"
MARKDOWN_FLAVOR_PACKAGE_NAME="markdown-flavor-detection"

if [[ ! -f "$PACKAGE_JSON" ]]; then
  die "package.json not found. Run this script from the repository root."
fi

if [[ ! -f "$MARKDOWN_FLAVOR_PACKAGE_JSON" ]]; then
  die "$MARKDOWN_FLAVOR_PACKAGE_JSON not found. Run this script from the repository root."
fi

# ---------------------------------------------------------------------------
# Read current versions and write new version
# ---------------------------------------------------------------------------

OLD_VERSION="$(jq -r '.version' "$PACKAGE_JSON")"
OLD_MARKDOWN_FLAVOR_VERSION="$(jq -r '.version' "$MARKDOWN_FLAVOR_PACKAGE_JSON")"

if [[ "$OLD_VERSION" == "null" || -z "$OLD_VERSION" ]]; then
  die "Could not read .version from $PACKAGE_JSON."
fi

if [[ "$OLD_MARKDOWN_FLAVOR_VERSION" == "null" || -z "$OLD_MARKDOWN_FLAVOR_VERSION" ]]; then
  die "Could not read .version from $MARKDOWN_FLAVOR_PACKAGE_JSON."
fi

TMP_ROOT="$(mktemp)"
TMP_MARKDOWN_FLAVOR="$(mktemp)"
trap 'rm -f "$TMP_ROOT" "$TMP_MARKDOWN_FLAVOR"' EXIT

jq \
  --arg v "$NEW_VERSION" \
  --arg packageName "$MARKDOWN_FLAVOR_PACKAGE_NAME" \
  '.version = $v | .dependencies[$packageName] = $v' \
  "$PACKAGE_JSON" > "$TMP_ROOT"
jq --arg v "$NEW_VERSION" '.version = $v' "$MARKDOWN_FLAVOR_PACKAGE_JSON" > "$TMP_MARKDOWN_FLAVOR"

mv "$TMP_ROOT" "$PACKAGE_JSON"
mv "$TMP_MARKDOWN_FLAVOR" "$MARKDOWN_FLAVOR_PACKAGE_JSON"

node scripts/check-release-versions.mjs --tag "v$NEW_VERSION" >/dev/null

echo "Version updated: $OLD_VERSION -> $NEW_VERSION"
echo "Markdown flavor package version updated: $OLD_MARKDOWN_FLAVOR_VERSION -> $NEW_VERSION"
