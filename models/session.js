'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sessionId: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {});
  Session.associate = function(models) {
    // associations can be defined here
  };
  return Session;
};