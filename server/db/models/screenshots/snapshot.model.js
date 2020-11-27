const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('snapshot', {

    image: DataTypes.TEXT,
    headers: DataTypes.JSON,
    status_code: DataTypes.INTEGER,
    page_title: DataTypes.STRING
  });
};