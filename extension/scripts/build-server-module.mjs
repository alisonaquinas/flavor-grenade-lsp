import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(scriptDir, '..');
const repoRoot = resolve(extensionRoot, '..');
const serverDir = resolve(extensionRoot, 'server');

rmSync(serverDir, { force: true, recursive: true });

runBun(['run', 'build'], repoRoot);
runNpx(
  [
    'esbuild',
    '../dist/main.js',
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--target=node20',
    '--outfile=server/main.js',
    '--keep-names',
    '--external:@nestjs/microservices',
    '--external:@nestjs/microservices/*',
    '--external:@nestjs/websockets',
    '--external:@nestjs/websockets/*',
    '--external:class-validator',
    '--external:class-transformer',
  ],
  extensionRoot,
);

function runBun(args, cwd) {
  const result =
    process.platform === 'win32'
      ? spawnSync('bun.exe', args, { cwd, stdio: 'inherit' })
      : spawnSync('bun', args, {
          cwd,
          stdio: 'inherit',
        });
  exitOnFailure(result);
}

function runNpx(args, cwd) {
  const result =
    process.platform === 'win32'
      ? spawnSync(
          'C:\\Windows\\System32\\cmd.exe',
          ['/d', '/s', '/c', ['npx', ...args].map(quoteWindowsArg).join(' ')],
          { cwd, stdio: 'inherit' },
        )
      : spawnSync('npx', args, {
          cwd,
          stdio: 'inherit',
        });
  exitOnFailure(result);
}

function exitOnFailure(result) {
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function quoteWindowsArg(value) {
  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}
