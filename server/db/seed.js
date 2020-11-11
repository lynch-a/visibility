const sequelize = require('.');

async function seed() {
	await sequelize.sync({ force: true });

	await sequelize.models.webpage.bulkCreate([
		{ 
			protocol: 'http',
			host: 'example.com',
			port: 80,
			response_code: 200,
			page_title: "Example seed page title",
			img: "nonesrylol"
		},
	]);

	var webpage = await sequelize.models.webpage.findOne();

	console.log("page: ", webpage);

	webpage.createHeader({
		key: "testkey",
		value: "testvalue"
	})
	
	console.log('DB Seeded!');
}

seed();