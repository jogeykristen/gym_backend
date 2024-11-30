const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  // Define associations here if needed
  User.associate = (models) => {
    // Example association: User has many Orders
    // User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });
  };

  return User;
};
