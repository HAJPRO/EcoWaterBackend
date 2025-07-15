const PermissionModel = require("../../models/Admin/permission.model");

class PermissionService {
  async CreatePermission(data) {
    try {
      const name = data.CreatePermissionname;
      const isExists = await PermissionModel.findOne({
        $or: [
          { name: data.name },
          { value: data.value }
        ]
      });

      if (!isExists) {
        const Permission = new PermissionModel(data);
        const permission = await PermissionModel.create(Permission);
        return { msg: "Ruxsat muvaffaqiyatli qo‘shildi!", permission };
      } else {
        return { msg: "Bunday nomdagi ruxsat allaqachon mavjud." };
      }
    } catch (err) {
      return { msg: "Xatolik yuz berdi", error: err };
    }
  }
  async GetAll() {
    try {
      const permissions = await PermissionModel.find()
      return { msg: "Barchasi", permissions }
    } catch (err) {
      return { msg: "Xatolik yuz berdi", error: err };
    }
  }
}

module.exports = new PermissionService();
