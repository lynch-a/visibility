const sequalize = require('./db');

async function main() {
	await sequalize.sync({force: true});
}

main();