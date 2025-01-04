const mongoose = require("mongoose");
const OptionsForSelectModel = require("../../models/Helpers/OptionsForSelect.model");

class HelpersService {
  async CreateOption(data) {
    const newData = {
      type: data.type,
      name: data.model.name,
      department: data.model.department
    }
    try {
      const matchName = await OptionsForSelectModel.findOne({ name: data.model.name });
      if (matchName) {
        return { msg: "Bunday nom mavjud" };
      } else {
        const option = await OptionsForSelectModel.create(newData);
        return { msg: "Muvaffaqiyatli qo'shildi" };
      }
    } catch (error) {
      return error.message;
    }
  }
  async GetOptionsByType(data) {
    try {
      const options = await OptionsForSelectModel.find({ type: data.type });
      return options;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new HelpersService();
