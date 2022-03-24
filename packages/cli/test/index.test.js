const assert = require('assert');
const { exec } = require('child_process');
const path = require('path');
const cli = require('../lib');

describe('@marcellejs/cli', () => {
  it('is CommonJS compatible', () => {
    assert.strictEqual(typeof require('../lib'), 'function');
  });

  it('basic functionality', () => {
    assert.strictEqual(typeof cli, 'function', 'It worked');
  });

  it('runs the program with `generate` argument', function (done) {
    this.timeout(5000);

    exec(`node ${path.join(__dirname, '../bin/marcelle.js')} generate`, (err, stdout, stderr) => {
      assert.strictEqual(err, null);
      assert.strictEqual(stderr, '');
      assert.ok(
        /Usage: marcelle generate \[type\]/.test(stdout),
        'stdout should contain "Usage: marcelle generate [type]"',
      );

      done();
    });
  });
});
