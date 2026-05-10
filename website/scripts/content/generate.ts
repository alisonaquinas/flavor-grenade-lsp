import { writeWebsiteGeneratedModules } from '../../src/content/pipeline/website/build';

const result = await writeWebsiteGeneratedModules('src/content/generated');

for (const diagnostic of result.diagnostics) {
  console.log(`${diagnostic.severity}: ${diagnostic.message}`);
}

if (result.diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
  process.exitCode = 1;
}
