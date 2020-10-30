const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./setup');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${path.dirname(__filename)}/db.sqlite`,
  //logQueryParameters: true,
  //benchmark: true
});

const modelDefiners = [
	require('./models/webpage.model'),
	require('./models/header.model'),
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;