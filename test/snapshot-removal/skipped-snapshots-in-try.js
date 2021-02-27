const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

const macro = (t, {cwd, ...options}) => withTemporaryFixture(t, cwd, (t, temporary) => testSnapshotPruning(t, {cwd: temporary, ...options}));

// This behavior is consistent with the expectation that discarded attempts
// should have no effect.
test('snapshots removed if skipped in a discarded try()', macro, {
	cwd: exec.cwd('skipped-snapshots-in-try'),
	cli: ['--update-snapshots'],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});
