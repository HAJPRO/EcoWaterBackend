const RoleService = require("../../services/Admin/role.service.js");
class RoleController {
  async CreateRole(req, res, next) {
    try {
      const data = await RoleService.CreateRole(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
