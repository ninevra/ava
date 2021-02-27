const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

const macro = (t, {cwd, ...options}) => withTemporaryFixture(t, cwd, (t, temporary) => testSnapshotPruning(t, {cwd: temporary, ...options}));

// This behavior is consistent with the expectation that discarded attempts
// should have no effect.
test('snapshots removed if used in a discarded try()', macro, {
	cwd: exec.cwd('try'),
	cli: ['--update-snapshots'],
	remove: true
});
