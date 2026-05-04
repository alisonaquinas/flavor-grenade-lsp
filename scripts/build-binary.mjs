import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import process from 'node:process';

const optionalNestExternals = [
  '@nestjs/microservices',
  '@nestjs/microservices/*',
  '@nestjs/websockets',
  '@nestjs/websockets/*',
  'class-validator',
  'class-transformer',
];

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printUsage();
  process.exit(0);
}

if (options.outfile === undefined) {
  printUsage();
  throw new Error('Missing required --outfile option.');
}

mkdirSync(dirname(options.outfile), { recursive: true });

const bunArgs = [
  'build',
  'src/main.ts',
  '--compile',
  ...optionalNestExternals.flatMap((external) => ['--external', external]),
];

if (options.minify) {
  bunArgs.push('--minify');
}

if (options.bytecode) {
  bunArgs.push('--bytecode');
}

if (options.target !== undefined) {
  bunArgs.push(`--target=${options.target}`);
}

bunArgs.push(`--outfile=${options.outfile}`);

run('bun', bunArgs);

const builtOutfile = resolveBuiltOutfile(options.outfile);

if (!builtOutfile.endsWith('.exe')) {
  chmodSync(builtOutfile, 0o755);
}

if (options.copyToExtension) {
  const copyArgs = ['scripts/copy-binary.mjs'];
  if (options.binaryName !== undefined) {
    copyArgs.push(options.binaryName);
  }
  run(process.execPath, copyArgs);
}

function parseArgs(rawArgs) {
  const parsed = {
    bytecode: false,
    copyToExtension: false,
    help: false,
    minify: false,
  };

  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--bytecode') {
      parsed.bytecode = true;
    } else if (arg === '--copy-to-extension') {
      parsed.copyToExtension = true;
    } else if (arg === '--minify') {
      parsed.minify = true;
    } else if (arg === '--target') {
      parsed.target = readValue(rawArgs, ++index, arg);
    } else if (arg.startsWith('--target=')) {
      parsed.target = arg.slice('--target='.length);
    } else if (arg === '--outfile') {
      parsed.outfile = readValue(rawArgs, ++index, arg);
    } else if (arg.startsWith('--outfile=')) {
      parsed.outfile = arg.slice('--outfile='.length);
    } else if (arg === '--binary-name') {
      parsed.binaryName = readValue(rawArgs, ++index, arg);
    } else if (arg.startsWith('--binary-name=')) {
      parsed.binaryName = arg.slice('--binary-name='.length);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}

function readValue(rawArgs, index, optionName) {
  const value = rawArgs[index];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing value for ${optionName}.`);
  }
  return value;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveBuiltOutfile(outfile) {
  const candidates = [outfile];
  if (!outfile.endsWith('.exe')) {
    candidates.push(`${outfile}.exe`);
  }

  const builtOutfile = candidates.find((candidate) => existsSync(candidate));
  if (builtOutfile !== undefined) {
    return builtOutfile;
  }

  throw new Error(`Built binary not found. Checked: ${candidates.join(', ')}`);
}

function printUsage() {
  console.log(`Usage: node scripts/build-binary.mjs --outfile <path> [options]

Options:
  --target <bun-target>       Cross-compile target, for example bun-linux-x64.
  --minify                    Minify the compiled server.
  --bytecode                  Precompile JavaScript bytecode.
  --copy-to-extension         Copy the built dist binary into extension/server/.
  --binary-name <name>        Name to use when copying into extension/server/.`);
}
