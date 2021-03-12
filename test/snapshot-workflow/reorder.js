const test = require('@ava/test');
const exec = require('../helpers/exec');
const {beforeAndAfter} = require('./helpers/macros');

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
