const { Plan } = require("../models");
const responseHelper = require("../helpers/responseHelper");
const constants = require("../helpers/constant");

exports.createPlan = async (req, res) => {
  try {
    const { durationInMonths, price, details } = req.body;
    console.log("durationInMonths = ",durationInMonths)

    if (!durationInMonths || !price) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        "Duration and price are required."
      );
    }

    const newPlan = await Plan.create({ durationInMonths, price, details });
    return responseHelper(
      res,
      constants.statusCode.successCode,
      "Plan created successfully.",
      newPlan
    );
  } catch (error) {
    console.error("Error creating plan:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      constants.messages.serverError
    );
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationInMonths, price, details } = req.body;

    const existingPlan = await Plan.findByPk(id);

    if (!existingPlan) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        "Plan not found."
      );
    }

    existingPlan.durationInMonths = durationInMonths || existingPlan.durationInMonths;
    existingPlan.price = price || existingPlan.price;
    existingPlan.details = details || existingPlan.details;

    await existingPlan.save();

    return responseHelper(
      res,
      constants.statusCode.successCode,
      "Plan updated successfully.",
      existingPlan
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      constants.messages.serverError
    );
  }
};

exports.listAllPlan = async(req,res)=>{
    try {
        const plans = await Plan.findAll();
        return responseHelper(
            res,
            constants.statusCode.successCode,
            "fetched all plans.",
            plans
          );
    }catch (error) {
        console.error("Error updating plan:", error);
        return responseHelper(
          res,
          constants.statusCode.serverError,
          constants.messages.serverError
        );
      }
}

exports.deletePlan = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the plan exists
      const existingPlan = await Plan.findByPk(id);
  
      if (!existingPlan) {
        return responseHelper(
          res,
          constants.statusCode.notFound,
          "Plan not found."
        );
      }
  
      // Delete the plan
      await Plan.destroy({ where: { id } });
  
      return responseHelper(
        res,
        constants.statusCode.successCode,
        "Plan deleted successfully.",
        { id } // Returning the ID of the deleted plan
      );
    } catch (error) {
      console.error("Error deleting plan:", error);
      return responseHelper(
        res,
        constants.statusCode.serverError,
        constants.messages.serverError
      );
    }
  };
  