/* eslint-disable @typescript-eslint/no-require-imports */
import { Before, After, BeforeAll } from '@cucumber/cucumber';
import { FGWorld } from '../world.js';

BeforeAll(function() {
  // ensure reports dir exists
  const fs = require('fs') as typeof import('fs');
  try { fs.mkdirSync('reports', { recursive: true }); } catch { /* already exists */ }
});

Before(function(this: FGWorld) {
  // Reset state per scenario
  this.lastResponse = null;
  this.lastDiagnostics = new Map();
  this.lastStatusNotif = null;
});

After(async function(this: FGWorld) {
  await this.cleanup();
});
