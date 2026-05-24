import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const releaseWorkflow = readFileSync('.github/workflows/release.yml', 'utf8');
const codeqlWorkflow = readFileSync('.github/workflows/codeql.yml', 'utf8');
const codeqlConfig = readFileSync('.github/codeql/codeql-config.yml', 'utf8');
const dependabotConfig = readFileSync('.github/dependabot.yml', 'utf8');
const gitleaksConfig = readFileSync('.gitleaks.toml', 'utf8');
const securitySastWorkflow = readFileSync('.github/workflows/security-sast.yml', 'utf8');
const extensionReleaseWorkflow = readFileSync('.github/workflows/extension-release.yml', 'utf8');
const websiteS3Workflow = readFileSync('.github/workflows/website-s3.yml', 'utf8');
const rootPackage = JSON.parse(readFileSync('package.json', 'utf8')) as {
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
const rootEslintConfig = readFileSync('eslint.config.js', 'utf8');
const extensionPackage = JSON.parse(readFileSync('extension/package.json', 'utf8')) as {
  scripts?: Record<string, string>;
};
const websitePackage = JSON.parse(readFileSync('website/package.json', 'utf8')) as {
  devDependencies?: Record<string, string>;
};
const websiteEslintConfig = readFileSync('website/eslint.config.js', 'utf8');
const cucumberConfig = readFileSync('cucumber.yaml', 'utf8');
const rootVerificationSpec = readFileSync('docs/test/markdown-flavor-verification-spec.md', 'utf8');
const extensionVerificationSpec = readFileSync(
  'extension/docs/tests/markdown-flavor-verification-spec.md',
  'utf8',
);
const task297 = readFileSync(
  'docs/plans/phase-21-markdown-flavor-bdd-validation/TASK-297.md',
  'utf8',
);
const task311 = readFileSync(
  'docs/plans/phase-E17-extension-flavor-host-verification/TASK-311.md',
  'utf8',
);

function expectSetupNodeCacheDisabled(workflowName: string, content: string): void {
  const setupNodeUses = content.match(/actions\/setup-node@/g) ?? [];
  const disabledSetupNodeUses =
    content.match(/actions\/setup-node@[\s\S]*?package-manager-cache: false/g) ?? [];

  expect(
    disabledSetupNodeUses.length,
    `${workflowName} must disable setup-node automatic package-manager caching for every use`,
  ).toBe(setupNodeUses.length);
}

const requiredFlavorGateFiles = [
  'docs/bdd/features/ofmarkdown-language-mode.feature',
  'docs/bdd/features/markdown-flavor-dialects.feature',
  'docs/test/markdown-flavor-unit-spec.md',
  'docs/test/markdown-flavor-integration-spec.md',
  'docs/test/markdown-flavor-e2e-spec.md',
  'docs/test/markdown-flavor-verification-spec.md',
  'docs/test/markdown-flavor-validation-spec.md',
  'docs/test/evidence/markdown-flavor-product-review.md',
  'docs/test/evidence/markdown-flavor-validation-run.md',
  'docs/test/evidence/markdown-flavor-host-boundary-review.md',
  'docs/test/evidence/markdown-flavor-research-trace.md',
  'extension/docs/tests/markdown-flavor-unit-spec.md',
  'extension/docs/tests/markdown-flavor-integration-spec.md',
  'extension/docs/tests/markdown-flavor-e2e-spec.md',
  'extension/docs/tests/markdown-flavor-verification-spec.md',
  'extension/docs/tests/markdown-flavor-validation-spec.md',
];

describe('CI workflow verification battery', () => {
  test('runs the root verification battery', () => {
    for (const command of [
      'bun run lint',
      'bun run typecheck',
      'bun run format:check',
      'bun run lint:dependencies',
      'bun run lint:installed-packages',
      'bun run lint:docs',
      'bun run build',
      'bun test --coverage',
      'bun run bdd',
    ]) {
      expect(workflow).toContain(command);
    }
  });

  test('runs strict CodeQL analysis for app and workflow code', () => {
    expect(codeqlWorkflow).toContain("branches: ['main', 'develop']");
    expect(codeqlWorkflow).toContain('language: actions');
    expect(codeqlWorkflow).toContain('language: javascript-typescript');
    expect(codeqlWorkflow).toContain('config-file: ./.github/codeql/codeql-config.yml');
    expect(codeqlWorkflow).toContain('Gate CodeQL alerts');
    expect(codeqlWorkflow).toContain('code-scanning/alerts?state=open&tool_name=CodeQL');
    expect(codeqlWorkflow).toContain('permissions:\n  contents: read');
    expect(codeqlWorkflow).toContain('persist-credentials: false');

    expect(codeqlConfig).toContain('disable-default-queries: false');
    expect(codeqlConfig).toContain('uses: security-and-quality');

    for (const ignoredPath of [
      'coverage/**',
      'dist/**',
      'extension/.vscode-test/**',
      'extension/dist/**',
      'extension/server/**',
      'website/.svelte-kit/**',
      'website/dist/**',
    ]) {
      expect(codeqlConfig).toContain(ignoredPath);
    }
  });

  test('runs layered free SAST and supply-chain scanners', () => {
    for (const scanner of ['Semgrep CE', 'GitHub Actions security', 'Gitleaks', 'OSV-Scanner']) {
      expect(securitySastWorkflow).toContain(scanner);
    }

    for (const command of [
      'semgrep==1.163.0',
      '--config p/default',
      '--config p/javascript',
      'actionlint_${ACTIONLINT_VERSION}_linux_amd64.tar.gz',
      'zizmor==1.25.2',
      '--persona=auditor --min-severity=medium --min-confidence=medium',
      'gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz',
      '"${RUNNER_TEMP}/gitleaks/gitleaks" dir .',
      '--config .gitleaks.toml',
      'osv-scanner/releases/download/v${OSV_SCANNER_VERSION}/osv-scanner_linux_amd64',
      './osv-scanner scan',
      '--lockfile bun.lock',
      '--lockfile extension/package-lock.json',
      '--lockfile website/package-lock.json',
      'github/codeql-action/upload-sarif@9e0d7b8d25671d64c341c19c0152d693099fb5ba',
    ]) {
      expect(securitySastWorkflow).toContain(command);
    }

    expect(dependabotConfig.match(/cooldown:/g)?.length).toBe(4);
    expect(dependabotConfig.match(/default-days: 7/g)?.length).toBe(4);

    expect(rootPackage.devDependencies?.['eslint-plugin-security']).toBe('4.0.0');
    expect(websitePackage.devDependencies?.['eslint-plugin-security']).toBe('4.0.0');
    expect(rootEslintConfig).toContain('security/detect-child-process');
    expect(websiteEslintConfig).toContain('security/detect-child-process');
    expect(gitleaksConfig).toContain('useDefault = true');
    expect(gitleaksConfig).toContain("'''^\\.git/'''");
    expect(gitleaksConfig).toContain("'''(^|/)node_modules/'''");
    expect(gitleaksConfig).toContain('5-key, 3-scenario-per-key coverage');
  });

  test('disables setup-node automatic package-manager caching in scanner-covered workflows', () => {
    expectSetupNodeCacheDisabled('CI', workflow);
    expectSetupNodeCacheDisabled('Extension Release', extensionReleaseWorkflow);
    expectSetupNodeCacheDisabled('Website S3', websiteS3Workflow);
  });

  test('targets dependency update streams at develop', () => {
    expect(dependabotConfig.match(/target-branch: 'develop'/g)?.length).toBe(4);
    expect(dependabotConfig).not.toContain("target-branch: 'main'");
  });

  test('lints every docs root with exact OFM docs globs', () => {
    const lintDocs = rootPackage.scripts?.['lint:docs'] ?? '';

    for (const command of [
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./docs "docs/**/*.md"',
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./website/docs "website/docs/**/*.md"',
      'markdownlint-obsidian --config .obsidian-linter.jsonc --vault-root ./extension/docs "extension/docs/**/*.md"',
    ]) {
      expect(lintDocs).toContain(command);
    }

    expect(workflow).toContain('bun run lint:docs');
    expect(workflow).toContain('node ../scripts/check-installed-packages.mjs .');
    expect(workflow).toContain('"!extension/docs/**"');
    expect(rootVerificationSpec).toContain('extension/docs/**/*.md');
    expect(extensionVerificationSpec).toContain('extension/docs/**/*.md');
  });

  test('keeps exact flavor gate files and features protected', () => {
    expect(cucumberConfig).toContain("'docs/bdd/features/**/*.feature'");
    expect(workflow).toContain('bun run bdd');

    for (const path of requiredFlavorGateFiles) {
      expect(existsSync(path), `${path} must stay in the verification gate`).toBe(true);
    }

    for (const path of [
      'docs/bdd/features/ofmarkdown-language-mode.feature',
      'docs/bdd/features/markdown-flavor-dialects.feature',
    ]) {
      expect(rootVerificationSpec).toContain(path);
      expect(task297).toContain(path);
    }
  });

  test('keeps exact extension flavor and marketplace selector proof gates documented', () => {
    expect(extensionPackage.scripts?.test).toContain('"src/**/*.test.ts"');
    expect(extensionPackage.scripts?.['test:host']).toBe('node scripts/run-host-tests.mjs');
    expect(extensionPackage.scripts?.['verify:marketplace-assets']).toBe(
      'node --import tsx --test "test/marketplace/readme-assets.test.ts" "test/marketplace/vsix-assets.test.ts"',
    );

    for (const path of [
      'extension/src/markdown-flavor.test.ts',
      'extension/src/test/suite/markdown-flavor.test.js',
      'extension/test/marketplace/readme-assets.test.ts',
      'extension/test/marketplace/vsix-assets.test.ts',
      'docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309.md',
    ]) {
      expect(extensionVerificationSpec).toContain(path);
      expect(task311).toContain(path);
    }
  });

  test('runs the extension verification battery', () => {
    for (const command of [
      'npm run compile',
      'npm test',
      'npm run test:host',
      'npm run verify:marketplace-assets',
      'npm run verify:package-targets',
    ]) {
      expect(workflow).toContain(command);
    }
  });

  test('signs the npm package tarball before release and publish', () => {
    expect(releaseWorkflow).toContain("- 'v*.*.*'");
    expect(releaseWorkflow).not.toContain("'v[0-9]+.[0-9]+.[0-9]+'");
    expect(releaseWorkflow).not.toContain('Build and sign npm package');
    expect(releaseWorkflow).not.toContain('dist/*.tgz');
    expect(workflow).not.toContain('${{ env.NPM_PACKAGE_PATH }}');

    for (const command of [
      'Pack npm package',
      'npm pack --ignore-scripts --json',
      'Upload npm package candidate',
      'needs: pack-npm-package',
      'node - "$TMPDIR/npm-metadata.json" "$TMPDIR/npm.tgz" <<',
      'npm 11.14.0 tarball integrity mismatch',
      'cosign sign-blob "$NPM_PACKAGE_PATH"',
      'cosign verify-blob "$NPM_PACKAGE_PATH"',
      '--certificate-identity "https://github.com/${GITHUB_REPOSITORY}/.github/workflows/ci.yml@refs/tags/${GITHUB_REF_NAME}"',
      'sha256sum "$package_name" > "$package_name.sha256"',
      'Upload signed npm package evidence',
      'npm-package/*.tgz.sha256',
      'npm publish "$NPM_PACKAGE_PATH" --provenance --access public --ignore-scripts',
      'Verify signed npm package evidence',
      'sha256sum --check "$package_name.sha256"',
      'Attach signed npm package to GitHub Release',
      'for attempt in {1..120}',
      'gh release upload "$GITHUB_REF_NAME" signed-npm-package/* --clobber',
    ]) {
      expect(workflow).toContain(command);
    }

    expect(releaseWorkflow).toContain(
      'gh release upload "$GITHUB_REF_NAME" dist/flavor-grenade-lsp-* --clobber',
    );

    expectStepOrder(workflow, [
      'bun run build',
      'npm pack --ignore-scripts --json',
      'Sign npm package with GitHub OIDC',
      'Publish to npmjs.com',
    ]);
  });

  test('keeps the extension release dry-run gate aligned with publish prerequisites', () => {
    for (const command of [
      "tags:\n      - 'ext-v*'",
      'bun install --frozen-lockfile --ignore-scripts',
      'Build extension client and bundled JS server',
      'npm run verify:package-targets',
      'Smoke Test Bundled JS Server',
      'xvfb-run -a npm run test:host',
      'sha256sum ./*.vsix > checksums.sha256',
      "contains(github.ref_name, '-test')",
      'Skip Marketplace publish for test tag',
      'vsce publish has no dry-run flag in @vscode/vsce 3.9.1',
      'vsce publish --packagePath vsix-artifacts/*.vsix',
    ]) {
      expect(extensionReleaseWorkflow).toContain(command);
    }

    expectStepOrder(extensionReleaseWorkflow, [
      'Run extension selector-proof tests',
      'Verify package target rules',
      'Run extension host selector-proof tests',
      'Build extension client and bundled JS server',
      'Smoke Test Bundled JS Server',
    ]);
  });

  test('preserves the website verification battery', () => {
    expect(workflow).toContain('working-directory: website');

    for (const command of ['npm run lint', 'npm run typecheck', 'npm test', 'npm run build']) {
      expect(workflow).toContain(command);
    }
  });

  test('keeps the website publishing dry-run gate build-only for test tags', () => {
    for (const command of [
      "tags:\n      - 'site-v*.*.*'",
      "- 'site-v*.*.*'",
      "- 'site-v*.*.*-test*'",
      'RELEASE_MODE=test',
      'Validate website release tag',
      'Verify production tag commit is on main',
      "${{ !contains(github.ref_name, '-test') }}",
      'npm run lint',
      'npm run typecheck',
      'npm test',
      'npm run build',
      'Smoke production build',
      'actions/upload-artifact',
      'actions/download-artifact',
      'aws-actions/configure-aws-credentials',
      'aws s3 sync website-dist',
      'aws cloudfront create-invalidation',
      'website-production',
      'id-token: write',
    ]) {
      expect(websiteS3Workflow).toContain(command);
    }

    expect(websiteS3Workflow).not.toContain("'v*.*.*'");
    expect(websiteS3Workflow).not.toContain("'v*.*.*-test*'");
    expect(websiteS3Workflow).not.toContain('actions/upload-pages-artifact');
    expect(websiteS3Workflow).not.toContain('actions/deploy-pages');
    expect(websiteS3Workflow).not.toContain('pages: write');
    expect(websiteS3Workflow).not.toContain('AWS_ACCESS_KEY_ID');
    expect(websiteS3Workflow).not.toContain('AWS_SECRET_ACCESS_KEY');

    expectStepOrder(websiteS3Workflow, [
      'Validate website release tag',
      'Install website dependencies',
      'Lint website',
      'Typecheck website',
      'Test website',
      'Build website',
      'Smoke production build',
      'actions/upload-artifact',
      'Deploy website to AWS S3',
      'actions/download-artifact',
      'aws-actions/configure-aws-credentials',
      'Sync immutable website assets',
      'Sync website HTML and metadata',
    ]);
  });
});

function expectStepOrder(content: string, expectedOrder: string[]): void {
  let previousIndex = -1;
  for (const marker of expectedOrder) {
    const index = content.indexOf(marker);
    expect(index, `${marker} must be present`).toBeGreaterThanOrEqual(0);
    expect(index, `${marker} must appear after the prior release gate step`).toBeGreaterThan(
      previousIndex,
    );
    previousIndex = index;
  }
}
