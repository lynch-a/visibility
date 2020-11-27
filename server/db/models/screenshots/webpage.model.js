const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('webpage', {
    protocol: DataTypes.STRING,
    host: DataTypes.STRING,
    port: DataTypes.INTEGER,
  });
};