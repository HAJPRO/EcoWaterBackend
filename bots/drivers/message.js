const {
  start,
  login,
  register,
  cancel,
  CreateFullname,
  CreateGender,
  CreateAge,
  CreateUsername,
  CreatePassword,
  CreatePassport,
  CreateRegion,
  CreateDistrict,
  CreateNeighborhood,
  CreateStreet,
  CreateHouse,
  CreatePhoneNumber,
  CreateCarType,
  CreateCarNumber,
  LoginUsername,
  LoginPassword
} = require("../drivers/helpers/start.js");

const { GetNewOrders } = require("../drivers/services/driver.service.js")
const UserModel = require("../../models/user.model.js");
const { handleDriverMessages } = require("./message/driver.message.js");
const { bot } = require("./bot.js");
bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  const driver = await UserModel.findOne({ chatId: chatId });
  await handleDriverMessages(msg);
  if (text === "/start") {
    start(msg);
  }
  if (text === "🔐 Kirish") {
    login(msg);
  }
  if (driver?.action === "login_username" && driver?.chatId) {
    LoginUsername(msg);
  }
  if (driver?.action === "login_password" && driver?.chatId) {
    LoginPassword(msg);
  }
  if (text === "🆔 Ro'yxatdan o'tish") {
    register(msg);
  }
  if (text === "❌ Bekor qilish") {
    cancel(msg);
  }
  if (driver?.action === "register") {
    CreateFullname(msg);
  }
  if (driver?.action === "register_gender") {
    CreateGender(msg);
  }
  if (driver?.action === "register_age") {
    CreateAge(msg);
  }
  if (driver?.action === "register_username") {
    CreateUsername(msg);
  }
  if (driver?.action === "register_password") {
    CreatePassword(msg);
  }
  if (driver?.action === "register_passport") {
    CreatePassport(msg);
  }
  if (driver?.action === "register_region") {
    CreateRegion(msg);
  }
  if (driver?.action === "register_district") {
    CreateDistrict(msg);
  }
  if (driver?.action === "register_neighborhood") {
    CreateNeighborhood(msg);
  }
  if (driver?.action === "register_street") {
    CreateStreet(msg);
  }
  if (driver?.action === "register_house_number") {
    CreateHouse(msg);
  }
  if (driver?.action === "register_phone_number") {
    CreatePhoneNumber(msg);
  }
  if (driver?.action === "register_car_type") {
    CreateCarType(msg);
  }
  if (driver?.action === "register_car_number") {
    CreateCarNumber(msg);
  }

});
