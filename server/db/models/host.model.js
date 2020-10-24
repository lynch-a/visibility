const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('host', {

    protocol: DataTypes.STRING,
    domain: DataTypes.DATE,
    port: DataTypes.INTEGER,
    img: DataTypes.STRING
  });
};

/*
username: {
	allowNull: false,
	type: DataTypes.STRING,
	unique: true,
	validate: {
		// We require usernames to have length of at least 3, and
		// only use letters, numbers and underscores.
		is: /^\w{3,}$/
	}
}
*/