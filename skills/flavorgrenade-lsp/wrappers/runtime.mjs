import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

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

export async function loadManifest(skillRoot = SKILL_ROOT) {
  const manifestPath = path.join(skillRoot, 'manifest.json');
  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

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
  return { checked: false, reason: 'verification-deferred' };
}

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

export async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}
