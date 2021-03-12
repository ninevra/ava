const path = require('path');
const {registerSharedWorker} = require('@ava/v3/plugin');

const worker = registerSharedWorker({
	filename: path.resolve(__dirname, 'semaphore-worker.js'),
	supportedProtocols: ['experimental']
});

async function create(key, initialValue) {
	await worker.available;
	const response = worker.publish({type: 'create', key, initialValue});
	await response.replies().next();
	return new Semaphore(key);
}

exports.create = create;

class Semaphore {
	constructor(key) {
		this.key = key;
	}

	async wait() {
		await worker.publish({type: 'wait', key: this.key}).replies().next();
	}

	signal() {
		worker.publish({type: 'signal', key: this.key});
	}

	async task(job) {
		await this.wait();
		try {
			return await job();
		} finally {
			this.signal();
		}
	}
}
