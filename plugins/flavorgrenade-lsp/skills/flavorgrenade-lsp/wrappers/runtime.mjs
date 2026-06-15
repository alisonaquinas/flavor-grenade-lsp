/**
 * Resolve and verify the embedded Flavor Grenade LSP runtime.
 *
 * Provides runtime target detection, manifest loading, digest validation,
 * optional Sigstore verification, and path confinement helpers for the skill
 * command wrapper.
 *
 * @module wrappers/runtime
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

/**
 * Return the runtime target name for the current platform and CPU.
 *
 * @returns {'linux-x64' | 'darwin-arm64' | 'darwin-x64' | 'win-x64'} The skill runtime target.
 * @throws {Error} When the current platform is not packaged by the skill.
 */
export function currentTarget() {
  const platform = process.platform;
  const arch = process.arch;
  if (platform === 'linux' && arch === 'x64') return 'linux-x64';
  if (platform === 'darwin' && arch === 'arm64') return 'darwin-arm64';
  if (platform === 'darwin' && arch === 'x64') return 'darwin-x64';
  if (platform === 'win32' && arch === 'x64') return 'win-x64';
  throw Object.assign(new Error(`Unsupported runtime ${platform}-${arch}.`), {
    code: 'FG_SKILL_UNSUPPORTED_RUNTIME',
    recoverable: false,
  });
}

/**
 * Load the skill manifest from a skill root.
 *
 * @param {string} [skillRoot] - Directory containing `manifest.json`.
 * @returns {Promise<object>} Parsed skill manifest.
 */
export async function loadManifest(skillRoot = SKILL_ROOT) {
  const manifestPath = path.join(skillRoot, 'manifest.json');
  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

/**
 * Resolve the manifest-declared executable and verify its digest.
 *
 * @param {object} [options] - Runtime resolution options.
 * @param {string} [options.skillRoot] - Alternate skill root for tests or packaged artifacts.
 * @param {string} [options.target] - Explicit target or `current`.
 * @returns {Promise<object>} Runtime metadata used by the wrapper commands.
 * @throws {Error} When the target, path, executable, or digest is invalid.
 */
export async function resolveRuntime(options = {}) {
  const skillRoot = options.skillRoot ?? SKILL_ROOT;
  const manifest = await loadManifest(skillRoot);
  const target = options.target === 'current' || options.target === undefined
    ? currentTarget()
    : options.target;
  const runtime = manifest.runtime;
  if (!runtime || runtime.target !== target) {
    throw Object.assign(
      new Error(`Manifest target ${runtime?.target ?? 'missing'} does not match ${target}.`),
      { code: 'FG_SKILL_RUNTIME_TARGET_MISMATCH', recoverable: false },
    );
  }

  const executable = path.resolve(skillRoot, runtime.executable);
  assertInside(skillRoot, executable, 'FG_SKILL_RUNTIME_PATH_ESCAPE');
  if (!existsSync(executable)) {
    throw Object.assign(new Error(`Bundled executable is missing for ${target}.`), {
      code: 'FG_SKILL_RUNTIME_MISSING',
      recoverable: true,
    });
  }
  const stat = statSync(executable);
  if (!stat.isFile()) {
    throw Object.assign(new Error('Bundled executable is not a file.'), {
      code: 'FG_SKILL_RUNTIME_NOT_FILE',
      recoverable: false,
    });
  }
  if (process.platform !== 'win32' && (stat.mode & 0o111) === 0) {
    throw Object.assign(new Error('Bundled executable is not executable.'), {
      code: 'FG_SKILL_RUNTIME_NOT_EXECUTABLE',
      recoverable: true,
    });
  }

  const sha256 = await sha256File(executable);
  if (!runtime.sha256 || sha256 !== runtime.sha256) {
    throw Object.assign(new Error('Bundled executable digest does not match manifest.'), {
      code: 'FG_SKILL_RUNTIME_DIGEST_MISMATCH',
      recoverable: false,
    });
  }

  return { manifest, target, executable, sha256, skillRoot };
}

/**
 * Verify the executable Sigstore bundle when policy and local tooling allow it.
 *
 * Digest verification is mandatory in {@link resolveRuntime}; this function is
 * the additional keyless signing check. Missing `cosign` or bundle files are
 * reported as skipped unless the caller requires signatures.
 *
 * @param {object} runtime - Runtime metadata from {@link resolveRuntime}.
 * @param {object} [options] - Signature policy flags.
 * @param {boolean} [options.noSignatureCheck] - Skip Sigstore verification.
 * @param {boolean} [options.requireSignature] - Fail closed when verification cannot run.
 * @returns {object} Signature verification result.
 */
export function verifySigstoreIfAvailable(runtime, options = {}) {
  if (options.noSignatureCheck) {
    return { checked: false, reason: 'disabled' };
  }
  const bundle = runtime.manifest.runtime.sigstoreBundle
    ? path.resolve(runtime.skillRoot, runtime.manifest.runtime.sigstoreBundle)
    : null;
  if (bundle === null || !existsSync(bundle)) {
    if (options.requireSignature) {
      throw Object.assign(new Error('Sigstore bundle is missing.'), {
        code: 'FG_SKILL_SIGNATURE_MISSING',
        recoverable: false,
      });
    }
    return { checked: false, reason: 'bundle-missing' };
  }
  const cosign = spawnSync('cosign', ['version'], { encoding: 'utf8', shell: false });
  if (cosign.status !== 0) {
    if (options.requireSignature) {
      throw Object.assign(new Error('cosign is unavailable.'), {
        code: 'FG_SKILL_SIGNATURE_VERIFIER_MISSING',
        recoverable: false,
      });
    }
    return { checked: false, reason: 'cosign-unavailable' };
  }
  const signature = runtime.manifest.runtime.signature ?? {};
  const verifyArgs = [
    'verify-blob',
    runtime.executable,
    '--bundle',
    bundle,
    '--certificate-oidc-issuer',
    signature.oidcIssuer ?? 'https://token.actions.githubusercontent.com',
  ];
  if (signature.certificateIdentity) {
    verifyArgs.push('--certificate-identity', signature.certificateIdentity);
  } else {
    verifyArgs.push(
      '--certificate-identity-regexp',
      signature.certificateIdentityRegexp ??
        '^https://github.com/alisonaquinas/flavor-grenade-lsp/.github/workflows/skill-release.yml@refs/tags/v.*',
    );
  }
  const verification = spawnSync('cosign', verifyArgs, {
    encoding: 'utf8',
    shell: false,
  });
  if (verification.status !== 0) {
    throw Object.assign(new Error('Sigstore verification failed.'), {
      code: 'FG_SKILL_SIGNATURE_INVALID',
      recoverable: false,
    });
  }
  return {
    checked: true,
    bundle: path.relative(runtime.skillRoot, bundle).replace(/\\/g, '/'),
    oidcIssuer: verifyArgs[verifyArgs.indexOf('--certificate-oidc-issuer') + 1],
  };
}

/**
 * Resolve a candidate path and ensure it remains inside an allowed root.
 *
 * @param {string} root - Allowed filesystem root.
 * @param {string} candidate - Path to validate.
 * @param {string} [code] - Error code to attach on failure.
 * @returns {string} Real or resolved candidate path.
 * @throws {Error} When the candidate escapes the root.
 */
export function assertInside(root, candidate, code = 'FG_SKILL_PATH_OUTSIDE_WORKSPACE') {
  const rootReal = realpathSync(root);
  const candidateReal = existsSync(candidate)
    ? realpathSync(candidate)
    : path.resolve(candidate);
  const relative = path.relative(rootReal, candidateReal);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return candidateReal;
  }
  throw Object.assign(new Error('Path is outside the allowed root.'), {
    code,
    recoverable: false,
  });
}

/**
 * Compute the SHA-256 digest for a file.
 *
 * @param {string} filePath - File to hash.
 * @returns {Promise<string>} Lowercase hexadecimal SHA-256 digest.
 */
export async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}
