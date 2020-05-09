const test = require('@ava/test');
const exec = require('../../helpers/exec');

test('can load CJS workers with a default export', async t => {
	await t.notThrowsAsync(exec.fixture());
});
