const { bot } = require("./bot");
const {
  RequestDepartment,
  RequestProduct,
  RequestWork,
  RequestQuantity,
} = require("./helpers/start");
const SeamUserModel = require("../../models/bots/seam/seam_user.model");

bot.on("callback_query", async (query) => {
  const user = await SeamUserModel.findOne({ chatId: query.from.id });
  const { data } = query;
  const chatId = query.from.id;
  if (user && user.action === "request_department") {
    RequestDepartment({ data, chatId, user });
  }
  if (user && user.action === "request_product") {
    RequestProduct({ data, chatId, user });
  }
  if (user && user.action === "request_work") {
    RequestWork({ data, chatId, user });
  }
  if (user && user.action === "request_quantity") {
    RequestQuantity({ data, chatId, user });
  }
});
