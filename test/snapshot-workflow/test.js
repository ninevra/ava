const test = require('@ava/test');

const exec = require('../helpers/exec');
const path = require('path');
const fs = require('fs').promises;
const {beforeAndAfter} = require('./helpers/macros');
const {withTemporaryFixture} = require('../helpers/with-temporary-fixture');
const {withCPU} = require('../helpers/with-cpu');

test('First run generates a .snap and a .md', async t => {
	await withCPU(() => withTemporaryFixture(exec.cwd('first-run'), async cwd => {
		const env = {
			AVA_FORCE_CI: 'not-ci'
		};

		await exec.fixture([], {cwd, env});

		const [, report] = await Promise.all([
			t.notThrowsAsync(fs.access(path.join(cwd, 'test.js.snap'))),
			fs.readFile(path.join(cwd, 'test.js.md'), 'utf8')
		]);
		t.snapshot(report, 'snapshot report');
	}));
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
	'Adding skipped snapshots followed by unskipped snapshots records blanks',
	beforeAndAfter,
	{
		cwd: exec.cwd('adding-skipped-snapshots'),
		expectChanged: true
	}
);

test(
	'Filling in blanks doesn\'t require --update-snapshots',
	beforeAndAfter,
	{
		cwd: exec.cwd('filling-in-blanks'),
		expectChanged: true
	}
);

test(
	'Changing a snapshot\'s label does not change the .snap or .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('changing-label'),
		expectChanged: false
	}
);

test(
	'With --update-snapshots, changing a snapshot\'s label updates the .snap and .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('changing-label'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test('With invalid .snap file and --update-snapshots, skipped snaps are omitted', async t => {
	await withCPU(() => withTemporaryFixture(exec.cwd('invalid-snapfile'), async cwd => {
		const env = {AVA_FORCE_CI: 'not-ci'};
		const snapPath = path.join(cwd, 'test.js.snap');
		const reportPath = path.join(cwd, 'test.js.md');

		await fs.writeFile(snapPath, Buffer.of(0x0A, 0x00, 0x00));

		const result = await exec.fixture(['--update-snapshots'], {cwd, env});
		const report = await fs.readFile(reportPath, 'utf8');

		t.snapshot(report, 'snapshot report');
		t.snapshot(result.stats.passed, 'passed tests');
		t.snapshot(result.stats.failed, 'failed tests');
		t.snapshot(result.stats.skipped, 'skipped tests');
	}));
});

test(
	'Removing all snapshots from a test retains its data',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-all-snapshots'),
		expectChanged: false
	}
);

test(
	'With --update-snapshots, removing all snapshots from a test removes the block',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-all-snapshots'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'Removing a snapshot assertion retains its data',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-snapshots'),
		expectChanged: false
	}
);

test(
	'With --update-snapshots, removing a snapshot assertion removes its data',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-snapshots'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'Removing a test retains its data',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-test'),
		expectChanged: false
	}
);

test(
	'With --update-snapshots, removing a test removes its block',
	beforeAndAfter,
	{
		cwd: exec.cwd('removing-test'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'Reordering tests does not change the .snap or .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('reorder'),
		expectChanged: false
	}
);

test(
	'With --update-snapshots, reordering tests reorders the .snap and .md',
	beforeAndAfter,
	{
		cwd: exec.cwd('reorder'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'With --update-snapshots, skipping snapshots preserves their data',
	beforeAndAfter,
	{
		cwd: exec.cwd('skipping-snapshot'),
		cli: ['--update-snapshots'],
		expectChanged: false
	}
);

test(
	'With --update-snapshots and t.snapshot.skip(), other snapshots are updated',
	beforeAndAfter,
	{
		cwd: exec.cwd('skipping-snapshot-update'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'With --update-snapshots, skipping tests preserves their data',
	beforeAndAfter,
	{
		cwd: exec.cwd('skipping-test'),
		cli: ['--update-snapshots'],
		expectChanged: false
	}
);

test(
	'With --update snapshots and test.skip(), other tests\' snapshots are updated',
	beforeAndAfter,
	{
		cwd: exec.cwd('skipping-test-update'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	'With --update-snapshots and --match, only selected tests are updated',
	beforeAndAfter,
	{
		cwd: exec.cwd('select-test-update'),
		cli: ['--update-snapshots', '--match', 'foo'],
		expectChanged: true
	}
);

test(
	'With --update-snapshots and line number selection, only selected tests are updated',
	beforeAndAfter,
	{
		cwd: exec.cwd('select-test-update'),
		cli: ['--update-snapshots', 'test.js:3-5'],
		expectChanged: true
	}
);

test(
	't.snapshot.skip() in discarded t.try() doesn\'t copy over old value',
	beforeAndAfter,
	{
		cwd: exec.cwd('discard-skip'),
		cli: ['--update-snapshots'],
		expectChanged: true
	}
);

test(
	't.snapshot.skip() in committed t.try() does copy over old value',
	beforeAndAfter,
	{
		cwd: exec.cwd('commit-skip'),
		cli: ['--update-snapshots'],
		expectChanged: false
	}
);
