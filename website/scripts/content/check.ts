import { compileCommonloom } from '../../src/content/pipeline/commonloom';

const result = await compileCommonloom({
  copyRoot: 'src/content/copy',
  mediaRoot: 'src/content/media',
  generatedRoot: 'src/content/generated',
});

for (const diagnostic of result.diagnostics) {
  console.log(`${diagnostic.severity}: ${diagnostic.message}`);
}

if (result.diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
  process.exitCode = 1;
}
