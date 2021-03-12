class Semaphore {
	constructor(initialValue) {
		this.value = initialValue;
		this.stack = [];
	}

	async wait() {
		this.value--;

		if (this.value < 0) {
			return new Promise(resolve => {
				this.stack.push(resolve);
			});
		}
	}

	signal() {
		this.value++;
		if (this.value <= 0) {
			this.stack.pop()();
		}
	}
}

exports.default = async ({negotiateProtocol}) => {
	const semaphores = new Map();
	const main = negotiateProtocol(['experimental']).ready();

	for await (const message of main.subscribe()) {
		const {type, key} = message.data;
		if (type === 'create') {
			const {initialValue} = message.data;
			if (!semaphores.has(key)) {
				semaphores.set(key, new Semaphore(initialValue));
			}

			message.reply();
		} else if (type === 'wait') {
			semaphores.get(key).wait().then(() => message.reply()); // eslint-disable-line promise/prefer-await-to-then
		} else if (type === 'signal') {
			semaphores.get(key).signal();
		}
	}
};
