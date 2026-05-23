import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const extensionRoot = resolve(scriptDir, '..');
const repoRoot = resolve(extensionRoot, '..');
const serverDir = resolve(extensionRoot, 'server');

rmSync(serverDir, { force: true, recursive: true });

run('bun', ['run', 'build'], repoRoot);
run(
  'npx',
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

function run(executable, args, cwd) {
  const command =
    process.platform === 'win32'
      ? process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe'
      : executable;
  const commandArgs =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', [executable, ...args].map(quoteWindowsArg).join(' ')]
      : args;
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
  });
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
