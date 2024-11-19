const express = require("express");
const { userCreate, validate } = require("../controller/userController");

const router = express.Router();

router.post("/createUser", validate("createUser"), userCreate);

module.exports = router;
