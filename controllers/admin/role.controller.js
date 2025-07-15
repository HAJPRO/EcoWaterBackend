const RoleService = require("../../services/Admin/role.service.js");
class RoleController {
  async Create(req, res, next) {
    try {
      const data = await RoleService.Create(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await RoleService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
