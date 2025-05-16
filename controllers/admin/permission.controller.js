const PermissionService = require("../../services/Admin/permission.service.js");
class PermissionController {
  async CreatePermission(req, res, next) {
    try {
      const data = await PermissionService.CreatePermission(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await PermissionService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();
