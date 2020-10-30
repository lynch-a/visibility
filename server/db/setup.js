function applyExtraSetup(sequelize) {
	const { webpage, header } = sequelize.models;

	webpage.hasMany(header);
	header.belongsTo(webpage);
}

module.exports = { applyExtraSetup };