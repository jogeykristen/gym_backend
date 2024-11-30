const express = require("express");
const {decode} = require("../middleware/auth")
const { userCreate, login, getUsers, validate } = require("../controller/userController");

const router = express.Router();

router.post("/createUser", validate("createUser"), userCreate);
router.post("/login",validate("login"),login);
router.get("/getUsers",decode, getUsers);

module.exports = router;
