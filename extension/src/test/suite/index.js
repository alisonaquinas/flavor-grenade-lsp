const suites = [
  require('./extension-host.test.js'),
  require('./activation-language-mode.test.js'),
  require('./command-bridges.test.js'),
  require('./status-failure.test.js'),
];

async function run() {
  const failures = [];
  for (const suite of suites) {
    for (const testCase of suite.tests) {
      try {
        await testCase.run();
        console.log(`pass ${suite.name} > ${testCase.name}`);
      } catch (error) {
        failures.push({ error, suite: suite.name, test: testCase.name });
        console.error(`fail ${suite.name} > ${testCase.name}`);
        console.error(error);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} extension host test(s) failed`);
  }
}

module.exports = { run };
