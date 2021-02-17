const test = require('@ava/test');

const exec = require('../helpers/exec');
const path = require('path');
const fs = require('fs').promises;
const {beforeAndAfter} = require('./helpers/macros');

test('First run generates a .snap and a .md', async t => {
	const cwd = exec.cwd('first-run');
	const env = {
		AVA_FORCE_CI: 'not-ci'
	};

	t.teardown(() => fs.unlink(path.join(cwd, 'test.js.md')));
	t.teardown(() => fs.unlink(path.join(cwd, 'test.js.snap')));

	await exec.fixture([], {cwd, env});

	await t.notThrowsAsync(fs.access(path.join(cwd, 'test.js.snap')));
	const report = await fs.readFile(path.join(cwd, 'test.js.md'), 'utf8');
	t.snapshot(report, 'snapshot report');
});

test(
	'Adding more snapshots to a test adds them to the .snap and .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('adding-snapshots'),
		expectChanged: true
	}
);

test(
	'Adding a test with snapshots adds them to the .snap and .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('adding-test'),
		expectChanged: true
	}
);

test(
	'Changing a test\'s title adds a new block, puts the old block at the end',
	beforeAndAfter,
	{
		cwd: exec.cwd('changing-title'),
		expectChanged: true
	}
);

test(
	'Adding skipped snapshots followed by unskipped snapshots throws RangeError',
	async t => {
		const cwd = exec.cwd('adding-skipped-snapshots');
		const env = {
			AVA_FORCE_CI: 'not-ci'
		};

		t.teardown(() => fs.unlink(path.join(cwd, 'test.js.md')));
		t.teardown(() => fs.unlink(path.join(cwd, 'test.js.snap')));

		await exec.fixture([], {cwd, env: {...env, TEMPLATE: 'true'}});

		const result = await t.throwsAsync(exec.fixture([], {cwd, env}));
		t.regex(result.stdout, /Error thrown in test/);
		t.regex(result.stdout, /RangeError/);
		t.regex(result.stdout, /Cannot record snapshot 2 for "foo", exceeds expected index of 1/);
	}
);