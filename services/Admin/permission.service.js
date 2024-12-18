const PermissionModel = require("../../models/permission.model");

class PermissionService {
  async addPermission(data) {
    try {
      const permission_name = data.permission_name;
      const isExists = await PermissionModel.findOne({ permission_name });
      if (!isExists) {
        const Permission = new PermissionModel(data);
        const permission = await PermissionModel.create(Permission);
        return { msg: "Permission Added successfully !", permission };
      } else {
        return { msg: "Permission name already exists" };
      }
    } catch (err) {
      return err;
    }
  }
}

module.exports = new PermissionService();
