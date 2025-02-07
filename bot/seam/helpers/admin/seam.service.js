const { bot } = require("../../bot");
const { AdminKeyboard, UserKeyboard } = require("../keyboards/keyboard");
const SeamUserModel = require("../../../../models/bots/seam/seam_user.model");
const SeamDepartmentModel = require("../../../../models/bots/seam/seam_department.model");
const SeamWorkModel = require("../../../../models/bots/seam/seam_work.model");
const SeamProductModel = require("../../../../models/bots/seam/seam_product.model");

class SeamService {
  async AdminPanel(data) {
    const chatId = data.msg.from.id;
    const text = data.msg.text;
    const id = data.user._id;
    if (text === `Foydalanuvchilar`) {
      const users = await SeamUserModel.find();
      let list = "";
      users.forEach((user) => {
        list += `${user.fullname} : ${user._id}\n`;
      });
      bot.sendMessage(
        chatId,
        `Foydalanuvchilar ro'yxati:
    ${list}`
      );
    }
    if (text === `Bo'lim qo'shish`) {
      const user = await SeamUserModel.findByIdAndUpdate(
        id,
        { action: "request_add_department" },
        { new: true }
      );
      bot.sendMessage(chatId, `Bo'lim nomini kiriting`);
    }
    if (text === `Ish turini qo'shish`) {
      const user = await SeamUserModel.findByIdAndUpdate(
        id,
        { action: "request_add_work" },
        { new: true }
      );
      bot.sendMessage(chatId, `Ish turini kiriting`);
    }
    if (text === `Mahsulot turini qo'shish`) {
      const user = await SeamUserModel.findByIdAndUpdate(
        id,
        { action: "request_add_product" },
        { new: true }
      );
      bot.sendMessage(chatId, `Mahsulot turini kiriting`);
    }
  }
  async AddDepartment(data) {
    const chatId = data.msg.from.id;
    const text = data.msg.text;
    const id = data.user._id;
    const department = await SeamDepartmentModel.create({ name: text });
    bot.sendMessage(chatId, `Bo'lim nomi qo'shildi`);

    const user = await SeamUserModel.findByIdAndUpdate(
      id,
      { action: "menu" },
      { new: true }
    );
    console.log(user);
  }
  async AddWorkType(data) {
    const chatId = data.msg.from.id;
    const text = data.msg.text;
    const id = data.user._id;
    const work = await SeamWorkModel.create({ name: text });
    bot.sendMessage(chatId, `ish nomi qo'shildi`);
    await SeamUserModel.findByIdAndUpdate(
      id,
      { action: "menu" },
      { new: true }
    );
  }
  async AddProductType(data) {
    const chatId = data.msg.from.id;
    const text = data.msg.text;
    const id = data.user._id;
    const work = await SeamProductModel.create({ name: text });
    bot.sendMessage(chatId, `Mahsulot turi qo'shildi`);
    await SeamUserModel.findByIdAndUpdate(
      id,
      { action: "menu" },
      { new: true }
    );
  }
}
module.exports = new SeamService();
