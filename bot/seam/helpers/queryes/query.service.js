const { bot } = require("../../bot");
const { AdminKeyboard, UserKeyboard } = require("../keyboards/keyboard");
const SeamUserModel = require("../../../../models/bots/seam/seam_user.model");
const SeamDepartmentModel = require("../../../../models/bots/seam/seam_department.model");

class QueryService {
  async AddDepartment(data) {
    const chatId = data.msg.from.id;
    const text = data.msg.text;
    const id = data.user._id;
    const department = await SeamDepartmentModel.create({ name: text });
    bot.sendMessage(chatId, `Bo'lim nomi qo'shildi`);
  }
}
module.exports = new QueryService();
