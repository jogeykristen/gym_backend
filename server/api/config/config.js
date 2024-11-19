const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("gym_backend", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
