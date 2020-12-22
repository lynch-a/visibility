const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./associations');
const path = require('path');

/*
docker config

const sequelize = new Sequelize('visibility', 'postgres', 'postgres', {
  host: 'db',
  dialect: 'postgres',
  logging: false
  //storage: `${path.dirname(__filename)}/db.sqlite`,
  //retry: { max: 10 }
  //logQueryParameters: true,
  //benchmark: true
});
*/

// non-docker config
const sequelize = new Sequelize('visibility', 'visibility', 'SOMETHINGSECURE', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
  //storage: `${path.dirname(__filename)}/db.sqlite`,
  //retry: { max: 10 }
  //logQueryParameters: true,
  //benchmark: true
});

const modelDefiners = [
  require('./models/screenshots/webpage.model'),
  require('./models/screenshots/snapshot.model'),
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;