const { bot } = require("../bot");
const HRAppeals = require("../../../models/HR/Appeals/appeal");

const start = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  await bot.sendMessage(
    chatId,
    `Assalomu alaykum!!! 
Hurmatli foydalanuvchi.

Sizda qandaydir murojaat va taklifingiz bo'lsa yozishingiz mumkin.`
  );
};

module.exports = { start };
