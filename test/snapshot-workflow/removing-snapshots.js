const test = require('@ava/test');
const exec = require('../helpers/exec');
const {beforeAndAfter} = require('./helpers/macros');

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
