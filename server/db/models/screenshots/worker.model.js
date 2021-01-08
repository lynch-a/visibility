const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('worker', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    queued: DataTypes.INTEGER,
    remote_port: DataTypes.INTEGER,
    local_port: DataTypes.INTEGER,
    tabs: DataTypes.INTEGER,
    connected: DataTypes.BOOLEAN
  });
};