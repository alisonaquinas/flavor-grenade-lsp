const path = require('node:path');
const Mocha = require('mocha');

function run() {
  const mocha = new Mocha({
    color: true,
    timeout: 15000,
    ui: 'bdd',
  });

  for (const file of [
    'extension-host.test.js',
    'activation-language-mode.test.js',
    'command-bridges.test.js',
    'status-failure.test.js',
  ]) {
    mocha.addFile(path.resolve(__dirname, file));
  }

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} extension host test(s) failed`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = { run };
