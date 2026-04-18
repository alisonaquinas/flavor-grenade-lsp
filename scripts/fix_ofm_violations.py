#!/usr/bin/env python3
"""
Fix OFM violations in docs/ directory.
Excludes docs/bdd/** and docs/templates/**
"""

import re
import os
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


def apply_replacements(content: str) -> str:
    # -----------------------------------------------------------------------
    # 1. tickets/ prefix removal
    # [[tickets/FEAT-NNN]] -> [[FEAT-NNN]], [[tickets/FEAT-NNN|text]] -> [[FEAT-NNN|text]]
    # Covers FEAT, TASK, CHORE, BUG
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[tickets/((?:FEAT|TASK|CHORE|BUG)-\d+)(\|[^\]]*)?]]',
        lambda m: f'[[{m.group(1)}{m.group(2) or ""}]]',
        content
    )

    # -----------------------------------------------------------------------
    # 2. OFM040 — Unknown callout type CHECK -> SUCCESS
    # -----------------------------------------------------------------------
    content = re.sub(r'>\s*\[!CHECK\]', '> [!SUCCESS]', content)

    # -----------------------------------------------------------------------
    # 3. bdd/features/XXX wikilinks -> code spans
    # [[bdd/features/XXX|display text]] -> `bdd/features/XXX.feature`
    # [[bdd/features/XXX]] -> `bdd/features/XXX.feature`
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[bdd/features/([^\]|]+)(?:\|[^\]]*)?\]\]',
        lambda m: f'`bdd/features/{m.group(1)}.feature`',
        content
    )

    # -----------------------------------------------------------------------
    # 4. security/XXX links -> requirements/security/XXX
    #    [[requirements/security]] (bare) -> [[requirements/security/index]]
    # -----------------------------------------------------------------------
    security_map = {
        'supply-chain': 'requirements/security/supply-chain',
        'parser-safety': 'requirements/security/parser-safety',
        'vault-confinement': 'requirements/security/vault-confinement',
        'input-validation': 'requirements/security/input-validation',
        'information-disclosure': 'requirements/security/information-disclosure',
    }
    for short, full in security_map.items():
        content = re.sub(
            r'\[\[security/' + re.escape(short) + r'(\|[^\]]*)?\]\]',
            lambda m, f=full: f'[[{f}{m.group(1) or ""}]]',
            content
        )
    # bare [[requirements/security]] -> [[requirements/security/index]]
    content = re.sub(
        r'\[\[requirements/security\]\]',
        '[[requirements/security/index]]',
        content
    )

    # -----------------------------------------------------------------------
    # 5. DDD domain-model links missing ddd/ prefix
    # -----------------------------------------------------------------------
    ddd_map = [
        (r'\[\[vault/domain-model(\|[^\]]*)?\]\]', 'ddd/vault/domain-model'),
        (r'\[\[reference-resolution/domain-model(\|[^\]]*)?\]\]', 'ddd/reference-resolution/domain-model'),
        (r'\[\[document-lifecycle/domain-model(\|[^\]]*)?\]\]', 'ddd/document-lifecycle/domain-model'),
        (r'\[\[lsp-protocol/domain-model(\|[^\]]*)?\]\]', 'ddd/lsp-protocol/domain-model'),
        (r'\[\[config/domain-model(\|[^\]]*)?\]\]', 'ddd/config/domain-model'),
    ]
    for pattern, replacement in ddd_map:
        content = re.sub(
            pattern,
            lambda m, r=replacement: f'[[{r}{m.group(1) or ""}]]',
            content
        )

    # -----------------------------------------------------------------------
    # 6. Wrong ADR/spec references
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[ofm-spec/block-anchors(\|[^\]]*)?\]\]',
        lambda m: f'[[ofm-spec/block-references{m.group(1) or ""}]]',
        content
    )
    content = re.sub(
        r'\[\[ofm-spec/properties(\|[^\]]*)?\]\]',
        lambda m: f'[[ofm-spec/frontmatter{m.group(1) or ""}]]',
        content
    )
    content = re.sub(
        r'\[\[adr/ADR005-link-style(\|[^\]]*)?\]\]',
        lambda m: f'[[adr/ADR005-wiki-style-binding{m.group(1) or ""}]]',
        content
    )

    # -----------------------------------------------------------------------
    # 7. [[ddd/ofm-parser/domain-model]] -> `ddd/ofm-parser` (no valid file)
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[ddd/ofm-parser/domain-model(\|[^\]]*)?\]\]',
        '`ddd/ofm-parser`',
        content
    )

    # -----------------------------------------------------------------------
    # 8. [[plans/phase-00-docs-scaffold]] -> [[plans/phase-00-docs-scaffold/index]]
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[plans/phase-00-docs-scaffold\]\]',
        '[[plans/phase-00-docs-scaffold/index]]',
        content
    )

    # -----------------------------------------------------------------------
    # 9. Non-markdown file wikilinks -> code spans
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[\.github/workflows/ci\.yml(\|[^\]]*)?\]\]',
        '`.github/workflows/ci.yml`',
        content
    )
    content = re.sub(
        r'\[\[\.github/workflows/publish\.yml(\|[^\]]*)?\]\]',
        '`.github/workflows/publish.yml`',
        content
    )

    # -----------------------------------------------------------------------
    # 10. [[docs/test/matrix]] -> [[test/matrix]], [[docs/test/index]] -> [[test/index]]
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[docs/test/matrix(\|[^\]]*)?\]\]',
        lambda m: f'[[test/matrix{m.group(1) or ""}]]',
        content
    )
    content = re.sub(
        r'\[\[docs/test/index(\|[^\]]*)?\]\]',
        lambda m: f'[[test/index{m.group(1) or ""}]]',
        content
    )

    # -----------------------------------------------------------------------
    # 11. [[plans/roadmap]] — file doesn't exist -> plain text
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[plans/roadmap(\|[^\]]*)?\]\]',
        'plans/roadmap',
        content
    )

    # -----------------------------------------------------------------------
    # 12. [[design/navigation]] — file doesn't exist -> plain text
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[design/navigation(\|[^\]]*)?\]\]',
        'design/navigation',
        content
    )

    return content


def main():
    files = get_all_md_files()
    changed = 0
    for path in sorted(files):
        original = path.read_text(encoding='utf-8')
        updated = apply_replacements(original)
        if updated != original:
            path.write_text(updated, encoding='utf-8')
            changed += 1
            print(f"  Fixed: {path.relative_to(DOCS_ROOT.parent)}")
    print(f"\nTotal files changed: {changed}")


if __name__ == '__main__':
    main()
