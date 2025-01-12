const express = require("express");
const {decode} = require("../middleware/auth")
const { userCreate, login, getUsers, validate, logout, refreshToken } = require("../controller/userController");

const router = express.Router();

router.post("/createUser", validate("createUser"), userCreate);
router.post("/login",validate("login"),login);
router.get("/getUsers",decode, getUsers);
router.post("/logout",logout)
router.post("/refreshToken",refreshToken)

module.exports = router;
