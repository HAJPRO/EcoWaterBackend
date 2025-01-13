const mongoose = require("mongoose");
const HRAppeals = require("../../../models/HR/Appeals/appeal.js");
class HRAppealsService {
  async GetAll(is_status) {
    const status = is_status.status;
    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.AllReturnRespons();
        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllAppeals();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength() {}

  async AllAppeals() {
    const items = await HRAppeals.find();
    return items;
  }
  async ReplyMessageCreate(data) {
    const message = await HRAppeals.findOne({ _id: data.id });
    const newData = message;
    newData.reply_message.push({
      date: new Date(),
      message: data.model.reply_message,
    });
    const items = await HRAppeals.findByIdAndUpdate(data.id, newData, {
      new: true,
    });
    return { msg: "Yuborildi", items };
  }
  async Delete(data) {
    const item = await HRAppeals.findByIdAndDelete(data.id);

    return { msg: "O'chirildi", item };
  }
}

module.exports = new HRAppealsService();
