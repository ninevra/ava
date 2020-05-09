const crypto = require('crypto');

module.exports = async ({negotiateProtocol}) => {
	const protocol = negotiateProtocol(['experimental']);

	const random = crypto.randomBytes(16).toString('hex');
	for await (const testWorker of protocol.testWorkers()) {
		testWorker.publish({random});
	}
};
