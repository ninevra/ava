console.time(__filename);

const test = require(process.env.AVA_PATH); // This fixture is copied to a temporary directory, so require AVA through its configured path.

console.timeLog(__filename);

test('without snapshots', t => {
	t.pass();
	console.timeLog(__filename);
});

console.timeLog(__filename);
