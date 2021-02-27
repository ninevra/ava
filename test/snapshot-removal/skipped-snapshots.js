const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

const macro = (t, {cwd, ...options}) => withTemporaryFixture(t, cwd, (t, temporary) => testSnapshotPruning(t, {cwd: temporary, ...options}));

test('snapshots remain if snapshot assertions are skipped', macro, {
	cwd: exec.cwd('skipped-snapshots'),
	cli: ['--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});
