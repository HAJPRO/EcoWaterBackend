const RoleModel = require("../../models/Admin/role.model");

class RoleService {
  async CreateRole(data) {
    try {
      const role_name = data.role_name;
      const isExists = await RoleModel.findOne({ role_name });
      if (!isExists) {
        const Role = new RoleModel(data);
        const role = await RoleModel.create(Role);
        return { msg: "Role Added successfully !", role };
      } else {
        return { msg: "Role name already exists" };
      }
    } catch (err) {
      return err;
    }
  }

}



module.exports = new RoleService();
