#!/usr/bin/env python3
"""
Pass 2 — Fix remaining OFM violations after pass 1.
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


def apply_replacements(content: str) -> str:
    # -----------------------------------------------------------------------
    # ADR name fixes (wrong names used in various files)
    # -----------------------------------------------------------------------
    # ADR013-path-traversal-prevention -> ADR013-vault-root-confinement
    content = re.sub(
        r'\[\[adr/ADR013-path-traversal-prevention([^\]]*)\]\]',
        lambda m: f'[[adr/ADR013-vault-root-confinement{m.group(1)}]]',
        content
    )
    # ADR014-supply-chain-policy -> ADR014-dependency-security-policy
    content = re.sub(
        r'\[\[adr/ADR014-supply-chain-policy([^\]]*)\]\]',
        lambda m: f'[[adr/ADR014-dependency-security-policy{m.group(1)}]]',
        content
    )
    # ADR014-security-policy -> ADR014-dependency-security-policy
    content = re.sub(
        r'\[\[adr/ADR014-security-policy([^\]]*)\]\]',
        lambda m: f'[[adr/ADR014-dependency-security-policy{m.group(1)}]]',
        content
    )
    # ADR013-vault-root (truncated) -> ADR013-vault-root-confinement
    content = re.sub(
        r'\[\[adr/ADR013-vault-root\]\]',
        '[[adr/ADR013-vault-root-confinement]]',
        content
    )
    content = re.sub(
        r'\[\[adr/ADR013-vault-root(\|[^\]]*)\]\]',
        lambda m: f'[[adr/ADR013-vault-root-confinement{m.group(1)}]]',
        content
    )

    # -----------------------------------------------------------------------
    # ofm-spec/properties#inline-tags -> ofm-spec/tags (with anchor fixup)
    # ofm-spec/properties#tag-hierarchies -> ofm-spec/tags#tag-hierarchy
    # ofm-spec/properties#tags-frontmatter -> ofm-spec/tags#yaml-frontmatter-tags
    # ofm-spec/properties (bare) -> ofm-spec/frontmatter (from pass 1, but with anchors missed)
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[ofm-spec/properties#inline-tags([^\]]*)\]\]',
        lambda m: f'[[ofm-spec/tags#inline-tag-syntax{m.group(1)}]]',
        content
    )
    content = re.sub(
        r'\[\[ofm-spec/properties#tag-hierarchies([^\]]*)\]\]',
        lambda m: f'[[ofm-spec/tags#tag-hierarchy{m.group(1)}]]',
        content
    )
    content = re.sub(
        r'\[\[ofm-spec/properties#tags-frontmatter([^\]]*)\]\]',
        lambda m: f'[[ofm-spec/tags#yaml-frontmatter-tags{m.group(1)}]]',
        content
    )
    # Catch any remaining bare ofm-spec/properties (should have been caught in pass 1)
    content = re.sub(
        r'\[\[ofm-spec/properties([^\]]*)\]\]',
        lambda m: f'[[ofm-spec/frontmatter{m.group(1)}]]',
        content
    )

    # -----------------------------------------------------------------------
    # .github/workflows/ci.yml and publish.yml WITH anchors -> code spans
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[\.github/workflows/ci\.yml[^\]]*\]\]',
        '`.github/workflows/ci.yml`',
        content
    )
    content = re.sub(
        r'\[\[\.github/workflows/publish\.yml[^\]]*\]\]',
        '`.github/workflows/publish.yml`',
        content
    )

    # -----------------------------------------------------------------------
    # Non-existent test doc wikilinks -> code spans
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[tests/unit/unit-vault-module\.md([^\]]*)\]\]',
        '`tests/unit/unit-vault-module.md`',
        content
    )
    content = re.sub(
        r'\[\[tests/integration/smoke-wiki-links\.md([^\]]*)\]\]',
        '`tests/integration/smoke-wiki-links.md`',
        content
    )
    content = re.sub(
        r'\[\[tests/integration/smoke-embeds\.md([^\]]*)\]\]',
        '`tests/integration/smoke-embeds.md`',
        content
    )

    # -----------------------------------------------------------------------
    # Non-existent design doc wikilinks -> code spans (plain text)
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[design/vault-scanner([^\]]*)\]\]',
        'design/vault-scanner',
        content
    )
    content = re.sub(
        r'\[\[design/completion-system([^\]]*)\]\]',
        'design/completion-system',
        content
    )
    content = re.sub(
        r'\[\[design/references-service([^\]]*)\]\]',
        'design/references-service',
        content
    )
    content = re.sub(
        r'\[\[design/definition-service([^\]]*)\]\]',
        'design/definition-service',
        content
    )
    content = re.sub(
        r'\[\[design/hover-handler([^\]]*)\]\]',
        'design/hover-handler',
        content
    )

    # -----------------------------------------------------------------------
    # [[Block.Anchor.Indexing]] -> `Block.Anchor.Indexing` (self-referential Planguage tag)
    # [[Config.Precedence.Layering]] -> `Config.Precedence.Layering`
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[Block\.Anchor\.Indexing\]\]',
        '`Block.Anchor.Indexing`',
        content
    )
    content = re.sub(
        r'\[\[Config\.Precedence\.Layering\]\]',
        '`Config.Precedence.Layering`',
        content
    )

    # -----------------------------------------------------------------------
    # [[bdd/features]] (bare directory) -> `bdd/features/` (code span)
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[bdd/features\]\]',
        '`bdd/features/`',
        content
    )

    # -----------------------------------------------------------------------
    # [[plans/roadmap#config]] and any remaining [[plans/roadmap]] -> plain text
    # (pass 1 fixed bare [[plans/roadmap]] but not with anchors)
    # -----------------------------------------------------------------------
    content = re.sub(
        r'\[\[plans/roadmap[^\]]*\]\]',
        'plans/roadmap',
        content
    )

    return content


def fix_ofm002_malformed_wikilinks(content: str, filepath: Path) -> str:
    """
    Fix malformed wikilinks (OFM002) — nested [[ and unclosed ]].
    These are specific to certain files and are handled per-file.
    """
    filename = filepath.name

    if filename == 'TASK-089.md' and 'phase-08-block-refs' in str(filepath):
        # Line 28: trigger text ending with `[[<stem>#^` before cursor
        # The `[[` in the description text is not a real wikilink, use code span
        # "- Trigger: text ending with `[[<stem>#^` before cursor"  - already in code span
        # But the OFM002 is: `[[doc#^ | [[requirements/completions]]` nested
        # Line 42: "| — | Block ref completion after [[doc#^ | [[requirements/block-references]] |"
        content = content.replace(
            '| — | Block ref completion after [[doc#^ | [[requirements/block-references]] |',
            '| — | Block ref completion after `[[doc#^` | [[requirements/block-references]] |'
        )

    if filename == 'TASK-094.md' and 'phase-09-completions' in str(filepath):
        # Line 51: "| — | Heading completion after [[doc# | [[requirements/completions]] |"
        content = content.replace(
            '| — | Heading completion after [[doc# | [[requirements/completions]] |',
            '| — | Heading completion after `[[doc#` | [[requirements/completions]] |'
        )

    if filename == 'TASK-099.md' and 'phase-09-completions' in str(filepath):
        # Line 41: "| — | Intra-document heading completion after [[# | [[requirements/completions]] |"
        content = content.replace(
            '| — | Intra-document heading completion after [[# | [[requirements/completions]] |',
            '| — | Intra-document heading completion after `[[#` | [[requirements/completions]] |'
        )

    if filename == 'TASK-100.md' and 'phase-09-completions' in str(filepath):
        # Title field in YAML frontmatter (line 2): title: "Implement intra-document block ref completion after [[#^"
        # -> use backtick-free representation since it's a YAML string
        content = content.replace(
            'title: "Implement intra-document block ref completion after [[#^"',
            'title: "Implement intra-document block ref completion after [[#^]]"'
        )
        # Line 16: # Implement intra-document block ref completion after [[#^
        content = content.replace(
            '# Implement intra-document block ref completion after [[#^',
            '# Implement intra-document block ref completion after `[[#^`'
        )
        # Line 26 / 40: "| — | Intra-document block ref completion after [[#^ | ... |"
        content = content.replace(
            '| — | Intra-document block ref completion after [[#^ | [[requirements/completions]] |',
            '| — | Intra-document block ref completion after `[[#^` | [[requirements/completions]] |'
        )
        # BDD scenario title in table cell (line 48):
        # | [[bdd/features/completions]] | `Intra-doc block ref completion after [[#^ returns current doc anchors` |
        # The [[bdd/...]] was already fixed to backtick in pass 1; the [[#^ in the scenario name
        # is inside a backtick span so it shouldn't cause issues, but let's check if line 48 had it
        # Pass 1 also fixed bdd links so the table cell backtick span is safe.

    if filename == 'FEAT-010.md' and 'phase-09-completions' in str(filepath):
        # Lines 105-106 in table:
        # | [[TASK-099]] | Implement intra-document heading completion after [[# | `open` |
        # | [[TASK-100]] | Implement intra-document block ref completion after [[#^ | `open` |
        content = content.replace(
            '| [[TASK-099]] | Implement intra-document heading completion after [[# | `open` |',
            '| [[TASK-099]] | Implement intra-document heading completion after `[[#` | `open` |'
        )
        content = content.replace(
            '| [[TASK-100]] | Implement intra-document block ref completion after [[#^ | `open` |',
            '| [[TASK-100]] | Implement intra-document block ref completion after `[[#^` | `open` |'
        )

    if filename == 'index.md' and 'phase-09-completions' in str(filepath):
        # Lines 14-15:
        # | [[TASK-099]] | Implement intra-document heading completion after [[# | Task | `open` |
        # | [[TASK-100]] | Implement intra-document block ref completion after [[#^ | Task | `open` |
        content = content.replace(
            '| [[TASK-099]] | Implement intra-document heading completion after [[# | Task | `open` |',
            '| [[TASK-099]] | Implement intra-document heading completion after `[[#` | Task | `open` |'
        )
        content = content.replace(
            '| [[TASK-100]] | Implement intra-document block ref completion after [[#^ | Task | `open` |',
            '| [[TASK-100]] | Implement intra-document block ref completion after `[[#^` | Task | `open` |'
        )

    return content


def main():
    files = get_all_md_files()
    changed = 0
    for path in sorted(files):
        original = path.read_text(encoding='utf-8')
        updated = apply_replacements(original)
        updated = fix_ofm002_malformed_wikilinks(updated, path)
        if updated != original:
            path.write_text(updated, encoding='utf-8')
            changed += 1
            print(f"  Fixed: {path.relative_to(DOCS_ROOT.parent)}")
    print(f"\nTotal files changed: {changed}")


if __name__ == '__main__':
    main()
