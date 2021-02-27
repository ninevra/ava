const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

const macro = (t, {cwd, ...options}) => withTemporaryFixture(t, cwd, (t, temporary) => testSnapshotPruning(t, {cwd: temporary, ...options}));

test('removing non-existent snapshots doesn\'t throw', withTemporaryFixture, exec.cwd('no-snapshots'), async (t, cwd) => {
	// Execute fixture; this should try to unlink the nonexistent snapshots, and
	// should not throw
	const run = exec.fixture(['--update-snapshots'], {
		cwd,
		env: {
			AVA_FORCE_CI: 'not-ci'
		}
	});

	await t.notThrowsAsync(run);
});


test(
	'without --update-snapshots, invalid .snaps are retained',
	withTemporaryFixture,
	exec.cwd('no-snapshots'),
	async (t, cwd) => {
		const snapPath = path.join(cwd, 'test.js.snap');
		const invalid = Buffer.of(0x0A, 0x00, 0x00);
		await fs.writeFile(snapPath, invalid);

		await exec.fixture([], {cwd});

		await t.notThrowsAsync(fs.access(snapPath));
		t.deepEqual(await fs.readFile(snapPath), invalid);
	}
);

test(
	'with --update-snapshots, invalid .snaps are removed',
	withTemporaryFixture,
	exec.cwd('no-snapshots'),
	async (t, cwd) => {
		const snapPath = path.join(cwd, 'test.js.snap');
		const invalid = Buffer.of(0x0A, 0x00, 0x00);
		await fs.writeFile(snapPath, invalid);

		await exec.fixture(['--update-snapshots'], {cwd});

		await t.throwsAsync(fs.access(snapPath), {code: 'ENOENT'}, 'Expected snapshot to be removed');
	}
);
