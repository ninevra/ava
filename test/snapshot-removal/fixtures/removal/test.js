console.time(__filename);

const test = require(process.env.AVA_PATH); // This fixture is copied to a temporary directory, so require AVA through its configured path.

if (process.env.TEMPLATE) {
	test('some snapshots', t => {
		t.snapshot('foo');
		t.snapshot('bar');
		t.pass();
		console.timeLog(__filename);
	});

	test('another snapshot', t => {
		t.snapshot('baz');
		t.pass();
		console.timeLog(__filename);
	});
} else {
	test('some snapshots', t => {
		t.pass();
		console.timeLog(__filename);
	});

	test('another snapshot', t => {
		t.pass();
		console.timeLog(__filename);
	});
}
