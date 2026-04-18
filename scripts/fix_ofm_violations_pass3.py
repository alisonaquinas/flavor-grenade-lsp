#!/usr/bin/env python3
"""
Pass 3 — Fix OFM004 ambiguous wikilinks.

Rules by file location:
- requirements/ files: bare names -> requirements/ qualified
- ofm-spec/index.md: [[block-references]] -> [[ofm-spec/block-references]]
"""

import re
from pathlib import Path

DOCS_ROOT = Path(__file__).parent.parent / "docs"
EXCLUDE_PREFIXES = [
    DOCS_ROOT / "bdd",
    DOCS_ROOT / "templates",
]


def should_process(path: Path) -> bool:
    for excl in EXCLUDE_PREFIXES:
        try:
            path.relative_to(excl)
            return False
        except ValueError:
            pass
    return True


def get_all_md_files():
    files = []
    for md in DOCS_ROOT.rglob("*.md"):
        if should_process(md):
            files.append(md)
    return files


# Ambiguous short names that should resolve to requirements/ in requirements context
REQUIREMENTS_AMBIGUOUS = [
    'block-references',
    'completions',
    'diagnostics',
    'navigation',
    'rename',
    'code-actions',
    'hover',
    'semantic-tokens',
]

# In ofm-spec/ context, block-references should go to ofm-spec/
OFMSPEC_AMBIGUOUS = [
    'block-references',
]


def qualify_wikilinks_in_requirements(content: str) -> str:
    """In requirements files, qualify ambiguous bare names to requirements/ prefix."""
    for name in REQUIREMENTS_AMBIGUOUS:
        # Match [[name]] or [[name|alias]] but NOT already qualified like [[requirements/name]]
        # We need to replace [[name]] but not [[something/name]]
        pattern = r'\[\[(' + re.escape(name) + r')((?:#[^\]|]*)?)(\|[^\]]*)?\]\]'
        def make_replacement(m, req_name=name):
            anchor = m.group(2) or ''
            alias = m.group(3) or ''
            return f'[[requirements/{req_name}{anchor}{alias}]]'
        content = re.sub(pattern, make_replacement, content)
    return content


def qualify_wikilinks_in_ofmspec(content: str) -> str:
    """In ofm-spec files, qualify ambiguous bare names to ofm-spec/ prefix."""
    for name in OFMSPEC_AMBIGUOUS:
        pattern = r'\[\[(' + re.escape(name) + r')((?:#[^\]|]*)?)(\|[^\]]*)?\]\]'
        def make_replacement(m, spec_name=name):
            anchor = m.group(2) or ''
            alias = m.group(3) or ''
            return f'[[ofm-spec/{spec_name}{anchor}{alias}]]'
        content = re.sub(pattern, make_replacement, content)
    return content


def main():
    files = get_all_md_files()
    changed = 0
    for path in sorted(files):
        original = path.read_text(encoding='utf-8')
        updated = original

        # Check if file is in requirements/
        try:
            rel = path.relative_to(DOCS_ROOT / "requirements")
            # It's in requirements/
            updated = qualify_wikilinks_in_requirements(updated)
        except ValueError:
            pass

        # Check if file is ofm-spec/index.md specifically
        try:
            rel = path.relative_to(DOCS_ROOT / "ofm-spec")
            if path.name == 'index.md':
                updated = qualify_wikilinks_in_ofmspec(updated)
        except ValueError:
            pass

        if updated != original:
            path.write_text(updated, encoding='utf-8')
            changed += 1
            print(f"  Fixed: {path.relative_to(DOCS_ROOT.parent)}")
    print(f"\nTotal files changed: {changed}")


if __name__ == '__main__':
    main()
