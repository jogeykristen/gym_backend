const dotenv = require("dotenv");
dotenv.config();

const statusCode = {
  successCode: 200,
  notFound: 404,
  serverError: 500,
  forbidden: 403,
  unprocessableEntity: 422,
  conflict: 409,
};

const messages = {
  userCreatedSuccess: "User  created successfully",
  userCreatedError: "Some error occurred while creating the user details",
  emailRequired: "Email is required",
  passwordRequired: "Password is required",
};

module.exports = {
  statusCode,
  messages,
};
