const RoleModel = require("../../models/Admin/role.model");

class RoleService {
  async Create(data) {
    try {
      const isExists = await RoleModel.findOne({
        $or: [
          { name: data.name },
          { value: data.value }
        ]
      });

      if (!isExists) {
        const Role = new RoleModel(data);
        const role = await RoleModel.create(Role);
        return { msg: "Rol muvaffaqiyatli qo‘shildi!", role };
      } else {
        return { msg: "Bunday nomdagi rol allaqachon mavjud." };
      }
    } catch (err) {
      return { msg: "Xatolik yuz berdi", error: err };
    }
  }

  async GetAll() {
    try {
      const roles = await RoleModel.find()
      return { msg: "Barchasi", roles }
    } catch (err) {
      return { msg: "Xatolik yuz berdi", error: err };
    }
  }

}



module.exports = new RoleService();
