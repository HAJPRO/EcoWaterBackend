const UserService = require("../../services/Admin/User.service");
class UserController {
  async createUser(req, res, next) {
    try {
      const data = await UserService.CreateUser(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetUsers(req, res, next) {
    try {
      const users = await UserService.GetUsers(req.body);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
  async GetRoles(req, res, next) {
    try {
      const roles = await UserService.GetRoles();
      res.status(200).json(roles);
    } catch (error) {
      next(error);
    }
  }
  async GetPermissions(req, res, next) {
    try {
      const permissions = await UserService.GetPermissions();
      res.status(200).json(permissions);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
