const { bot } = require("../../seam/bot");
const SeamUserModel = require("../../../models/bots/seam/seam_user.model");

const CreateMessage = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
};

module.exports = { CreateMessage };
