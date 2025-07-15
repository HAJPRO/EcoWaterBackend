const { GetOrders } = require("../services/driver.service");
const UserModel = require("../../../models/user.model");

const handleDriverMessages = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  const driver = await UserModel.findOne({ chatId });

  if (driver?.action === "login_successfully" && driver?.role === "driver" && text === '🆕 Yangi zakazlar') {
    GetOrders(msg);
  }

  // Boshqa haydovchi uchun message handlerlar shu yerga yoziladi
};

module.exports = {
  handleDriverMessages
};
