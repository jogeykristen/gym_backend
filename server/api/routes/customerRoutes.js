const express = require("express");
const router = express.Router();
const {createCustomer, updateCustomer, searchCustomer} = require("../controller/customerController");

router.post("/createCustomers", createCustomer);
router.put("/updateCustomers/:id", updateCustomer);
router.get("/searchCustomer",searchCustomer)

module.exports = router;