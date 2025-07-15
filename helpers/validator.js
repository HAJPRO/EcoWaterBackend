const { check } = require("express-validator");

exports.registerValidator = [
  check("email", "Username is required !").not().isEmpty(),
  check("password", "Password is required !").not().isEmpty(),
];
