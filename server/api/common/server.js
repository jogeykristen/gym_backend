const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");
const sequelize = require("../config/config");
const User = require("../models/user");
const userRoutes = require("../routes/userRoutes");
const planRoutes = require("../routes/planRouter");
const customerRoutes = require("../routes/customerRoutes")

const express = require("express");
const app = express();

app.use(express.json());
app.use("/user", userRoutes);
app.use("/plan",planRoutes);
app.use("/customer",customerRoutes);

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDatabase();

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
