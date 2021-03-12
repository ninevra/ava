const os = require('os');
const semaphorePlugin = require('./semaphore-plugin');

const cpuSemaphorePromise = semaphorePlugin.create('cpus', os.cpus().length);

async function withCPU(task) {
	const cpuSemaphore = await cpuSemaphorePromise;
	return cpuSemaphore.task(task);
}

exports.withCPU = withCPU;
