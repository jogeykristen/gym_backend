const express = require("express");
const {decode} = require("../middleware/auth")
const { createPlan, updatePlan, listAllPlan, deletePlan } = require("../controller/planController");


const router = express.Router();

router.post("/createPlan", createPlan);
router.put("/updatePlan/:id", updatePlan);
router.get("/listAllPlans",listAllPlan)
router.delete("/deletePlan/:id",deletePlan)

module.exports = router;