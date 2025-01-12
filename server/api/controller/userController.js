const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { User } = require("../models");
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        "Validation failed",
        errors.array()
      );
    }

    const user = await User.findOne({where:{email:email}})
    if(!user){
      return responseHelper(res, constants.statusCode.notFound, constants.messages.userNotFound)
    }
    console.log("user ===== ",user)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){
      return responseHelper(res, constants.statusCode.notFound, constants.messages.invalidPassword)
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "access_secret", 
      { expiresIn: "24h" } 
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      "refresh_secret",
      { expiresIn: "7d" } 
    );
    user.refreshToken = refreshToken;
    await user.save();
    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userCreatedSuccess,
      {
        user:{
          id:user.id,
          name:user.name,
          email:user.email,
        },
        token,
        refreshToken
      }
    );
  }catch (error) {
    console.error("Error creating user:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      constants.messages.loginError
    );
  }
}

exports.getUsers = async(req, res)=>{
  try {
    console.log("hi")
    const user = req.user.userId
    console.log("id === ",user)
    
    const users = await User.findAll({where:{id:user},
    attributes:{exclude:["password"]}
    })

    if(!users){
      return responseHelper(res, constants.statusCode.notFound, constants.messages.userNotFound)
    }
    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userCreatedSuccess,
      users
    )
  }catch (error) {
    console.error("Error creating user:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      constants.messages.loginError
    );
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return responseHelper(
        res,
        constants.statusCode.unauthorized,
        "Refresh token is required."
      );
    }

    jwt.verify(refreshToken, "refresh_secret", (err, decoded) => {
      if (err) {
        return responseHelper(
          res,
          constants.statusCode.forbidden,
          "Invalid refresh token."
        );
      }

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        "access_secret",
        { expiresIn: "1h" } // Access token expires in 1 hour
      );

      return responseHelper(res, constants.statusCode.successCode, "Token refreshed successfully", {
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      "Token refresh failed."
    );
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return responseHelper(
        res,
        constants.statusCode.unauthorized,
        "Refresh token is required for logout."
      );
    }
    console.log("id === ",req.user)
    const user = req.user.userId
    console.log("id === ",user)
    
    const users = await User.findOne({where:{id:user}})
    console.log("users ============== ",users)
    console.log("users ============== ",users.refreshToken)
    users.refreshToken = null;
    await users.save();

    // Optionally, add logic to invalidate refresh tokens by using a token store or database.

    return responseHelper(res, constants.statusCode.successCode, "Logout successful.");
  } catch (error) {
    console.error("Error during logout:", error);
    return responseHelper(
      res,
      constants.statusCode.serverError,
      "Logout failed."
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
    case "login":{
      return [
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail(),
          check("password")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
      ]
    }
  }
};
