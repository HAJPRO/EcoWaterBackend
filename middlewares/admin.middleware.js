const BaseError = require("../errors/base.error");

module.exports = async function onlyAdminAccess(req, res, next) {
  try {
    const Role = req.user.role;
    if (Role != 1000) {
      return next(
        BaseError.BadRequest("You haven't permission to this route !")
      );
    }
    next();
  } catch (error) {
    return next(BaseError.BadRequest("You haven't permission to this route !"));
  }
};
