const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

const macro = (t, {cwd, ...options}) => withTemporaryFixture(t, cwd, (t, temporary) => testSnapshotPruning(t, {cwd: temporary, ...options}));

test('snapshots are removed when tests stop using them', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots'],
	remove: true
});

test('snapshots removed if --match selects all tests', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots', '--match=\'*snapshot*\''],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if tests selected by line numbers', macro, {
	cwd: exec.cwd('removal'),
	cli: ['test.js:10-17', '--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots removed if line numbers select all tests', macro, {
	cwd: exec.cwd('removal'),
	cli: ['test.js:0-100', '--update-snapshots'],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if not updating', macro, {
	cwd: exec.cwd('removal'),
	cli: [],
	remove: false
});

test('snapshots remain if they are still used', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots'],
	remove: false,
	env: {
		TEMPLATE: 'true'
	},
	async checkRun(t, run) {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if tests run with --match', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots', '--match=\'*another*\''],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});
