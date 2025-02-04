const { bot } = require("../bot");
const SeamUserModel = require("../../../models/bots");
const SeamDepartmentModel = require("../../../models/bots/seam/seam_department.model");

bot.on("callback_query", async (query) => {
  console.log(query);
});
