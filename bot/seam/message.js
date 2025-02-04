const {
  start,
  RequestFullname,
  CreateFullname,
  RequestCode,
  RequestPhoneNumber,
  RequestDepartment,
} = require("../seam/helpers/start.js");
const SeamUserModel = require("../../models/bots/seam/auth.model.js");

const { bot } = require("./bot.js");
bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;

  const user = await SeamUserModel.findOne({ chatId: chatId });

  if (text === "/start") {
    start(msg);
  }
  if (text === "Ro'yxatdan o'tish") {
    RequestFullname(msg);
    // await RequestCode(msg);
  }
  if (user && user.action === "request_fullname") {
    CreateFullname({ msg, id: user._id });
  }
  if (user && user.action === "request_code") {
    RequestCode({ msg, id: user._id });
  }
  if (user && user.action === "request_phone_number") {
    RequestPhoneNumber({ msg, id: user._id });
  }
  if (user && user.action === "request_department") {
    RequestDepartment({ msg, id: user._id });
  }
});
