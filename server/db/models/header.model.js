const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('header', {

    key: DataTypes.STRING,
    value: DataTypes.STRING,
  });
};