const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { Customers, Plan } = require("../models");
const responseHelper = require("../helpers/responseHelper");
const constants = require("../helpers/constant");
const { check, validationResult } = require("express-validator");

const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
  };
  
  // Helper function to calculate end date
  const calculateEndDate = (startDate, durationMonths) => {
    const start = new Date(startDate);
    if (isNaN(start)) {
      throw new Error("Invalid start date");
    }
    start.setMonth(start.getMonth() + durationMonths);
    return start.toISOString().split("T")[0];
  };
  
  // Create Customer
  exports.createCustomer = async (req, res) => {
    try {
      const { name, mobile, email, password, plan_id, start_date, pt, address, weight, image } = req.body;
      
      console.log("Start date received:", start_date);

      if (!isValidDate(start_date)) {
        return responseHelper(res, constants.statusCode.unprocessableEntity, "Invalid start date format.");
      }

      const existingUser = await Customers.findAll({
        where: {
          [Op.or]: [{ mobile: mobile }, { email: email }],
        },
      });
      if (existingUser.length > 0) {
        return responseHelper(
          res,
          constants.statusCode.conflict,
          "Customer  already exists with the provided email or mobile number."
        );
      }
  
      const plan = await Plan.findByPk(plan_id);
      if (!plan) {
        return responseHelper(res, constants.statusCode.notFound, "Invalid plan ID.");
      }
      console.log("duration ========== ", plan.durationInMonths);
  
      const end_date = calculateEndDate(start_date, plan.durationInMonths);
      console.log("end datte =================== ",end_date)
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newCustomer = await Customers.create({
        name,
        mobile,
        email,
        password: hashedPassword,
        plan_id,
        start_date,
        end_date,
        pt,
        address,
        weight,
        image,
      });
  
      return responseHelper(res, constants.statusCode.successCode, "Customer registered successfully.", newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      return responseHelper(res, constants.statusCode.serverError, "Failed to create customer.");
    }
  };

  exports.updateCustomer = async (req, res) => {
    try {
      const { id } = req.params; 
      const { plan_id, start_date, pt, address, weight, image } = req.body;
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper(
          res,
          constants.statusCode.unprocessableEntity,
          "Validation failed",
          errors.array()
        );
      }
  
      if (req.body.name || req.body.mobile || req.body.email || req.body.password) {
        return responseHelper(
          res,
          constants.statusCode.unprocessableEntity,
          "You cannot update name, mobile, email, or password."
        );
      }
  
      console.log("Start date received:", start_date);
  
      if (start_date && !isValidDate(start_date)) {
        return responseHelper(res, constants.statusCode.unprocessableEntity, "Invalid start date format.");
      }
  
      const customer = await Customers.findByPk(id);
      if (!customer) {
        return responseHelper(res, constants.statusCode.notFound, "Customer not found.");
      }
  
      let end_date = customer.end_date; 
  
      if (plan_id) {
        const plan = await Plan.findByPk(plan_id);
        if (!plan) {
          return responseHelper(res, constants.statusCode.notFound, "Invalid plan ID.");
        }
  
        const durationMonths = plan.durationInMonths;
        const newStartDate = start_date || customer.start_date; 
        end_date = calculateEndDate(newStartDate, durationMonths);
        customer.start_date = newStartDate; 
        customer.plan_id = plan_id; 
      }
      if (pt !== undefined) customer.pt = pt;
      if (address) customer.address = address;
      if (weight) customer.weight = weight;
      if (image) customer.image = image;
  
      customer.end_date = end_date; 
      await customer.save();
  
      return responseHelper(
        res,
        constants.statusCode.successCode,
        "Customer updated successfully.",
        customer
      );
    } catch (error) {
      console.error("Error updating customer:", error);
      return responseHelper(
        res,
        constants.statusCode.serverError,
        "Failed to update customer."
      );
    }
  };



exports.searchCustomer = async (req, res) => {
  try {
    const { mobile, email } = req.query;  // Get mobile or email from query

    // Check if both mobile and email are provided, return error if both are present
    if (mobile && email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide either mobile or email, not both."
      });
    }

    // Check if neither mobile nor email is provided
    if (!mobile && !email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide either mobile or email to search."
      });
    }

    // Check if one of mobile or email is provided and ensure it's not undefined or empty
    const whereClause = {};
    if (mobile) {
      whereClause.mobile = mobile;
    } else if (email) {
      whereClause.email = email;
    }

    // Find customers by mobile or email
    const customers = await Customers.findAll({
      where: whereClause
    });

    if (customers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No customer found with the provided mobile or email."
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Customer(s) found.",
      data: customers
    });

  } catch (error) {
    console.error("Error searching for customer:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to search for customer."
    });
  }
};

  
  