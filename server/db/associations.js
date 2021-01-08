function applyExtraSetup(sequelize) {
	const { webpage, snapshot, worker } = sequelize.models;

	webpage.hasMany(snapshot);
	snapshot.belongsTo(webpage);
}

module.exports = { applyExtraSetup };