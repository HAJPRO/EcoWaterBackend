const PermissionService = require("../../services/Admin/permission.service.js");
class PermissionController {
  async addPermission(req, res, next) {
    try {
      const data = await PermissionService.addPermission(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();
