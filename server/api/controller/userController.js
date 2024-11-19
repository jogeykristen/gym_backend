const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const User = require("../models/user");
const responseHelper = require("../helpers/responseHelper");
const constants = require("../helpers/constant");
const { check, validationResult } = require("express-validator");

exports.userCreate = async (req, res) => {
  try {
    console.log("asd === ", req.body);
    const { name, mobile, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        "Validation failed",
        errors.array()
      );
    }

    const existingUser = await User.findAll({
      where: {
        [Op.or]: [{ mobile: mobile }, { email: email }],
      },
    });
    if (existingUser.length > 0) {
      return responseHelper(
        res,
        constants.statusCode.conflict,
        "User  already exists with the provided email or mobile number."
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("hashed ===== ", hashedPassword);
    const newUser = new User({ name, mobile, email, password: hashedPassword });
    await newUser.save();
    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userCreatedSuccess,
      newUser
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      constants.messages.userCreatedError
    );
  }
};

exports.validate = (method) => {
  switch (method) {
    case "createUser": {
      return [
        check("name").notEmpty().withMessage("Name is required"),
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Invalid email format"),
        check("password")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
        check("mobile")
          .notEmpty()
          .withMessage("Mobile number is required")
          .isNumeric()
          .withMessage("Mobile number must be numeric")
          .isLength({ min: 10, max: 10 })
          .withMessage("Mobile number must be exactly 10 digits"),
      ];
    }
  }
};
