const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('webpage', {

    protocol: DataTypes.STRING,
    host: DataTypes.STRING,
    port: DataTypes.INTEGER,
    response_code: DataTypes.INTEGER,
    page_title: DataTypes.STRING,
    img: DataTypes.TEXT
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