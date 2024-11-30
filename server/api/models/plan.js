const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Plan = sequelize.define("Plan", {
    durationInMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Plan.associate = (models) => {
    Plan.hasMany(models.Customers, { foreignKey: "plan_id", as: "customers" });
  };

  return Plan;
};
