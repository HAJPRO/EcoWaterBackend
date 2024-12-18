const RoleService = require("../../services/Admin/role.service.js");
class RoleController {
  async storeRole(req, res, next) {
    try {
      const data = await RoleService.storeRole(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
