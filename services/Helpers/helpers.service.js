const mongoose = require("mongoose");
const MaterialNameModel = require("../../models/Helpers/MaterialNames.model");

class HelpersService {
  async CreateMaterialName(data) {
    try {
      const matchName = await MaterialNameModel.findOne({ name: data.name });
      if (matchName) {
        return { msg: "Bunday nomli material mavjud" };
      } else {
        const materialName = await MaterialNameModel.create(data);
        return { msg: "Muvaffaqiyatli qo'shildi" };
      }
    } catch (error) {
      return error.message;
    }
  }
  async GetAllMaterialNames(data) {
    try {
      const materiales = await MaterialNameModel.find();

      return materiales;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new HelpersService();
