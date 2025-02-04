const { bot } = require("../bot");
const HRAppeals = require("../../../models/HR/Appeals/appeal");

const CreateMessage = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  const data = await HRAppeals.create({ message: text });
  if (data) {
    await bot.sendMessage(
      chatId,
      `Sizning murojaatingiz ma'muriyatga yuborildi tez orada ko'rib chiqib javob berishadi.`
    );
  }
};

module.exports = { CreateMessage };
