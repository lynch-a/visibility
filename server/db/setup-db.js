const sequalize = require('.');

async function main() {
	await sequalize.sync({force: true});
}

main();