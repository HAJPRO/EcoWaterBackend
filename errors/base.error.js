module.exports = class BaseError extends Error {
  status;
  errors;
  message;


  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.message = message;
  }

  static UnauthorizedError() {
    return new BaseError(401, "User is not authorizet !");
  }
  static BadRequest(message, errors = []) {
    return new BaseError(400, errors, message);
  }
};
