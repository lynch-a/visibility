function applyExtraSetup(sequelize) {
	const { webpage, snapshot } = sequelize.models;

	webpage.hasMany(snapshot);
	snapshot.belongsTo(webpage);
}

module.exports = { applyExtraSetup };