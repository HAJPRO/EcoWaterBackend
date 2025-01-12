const { start } = require("./helpers/start.js");
const { CreateMessage } = require("./helpers/create.js");

const { bot } = require("./bot.js");
bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  if (text === "/start") {
    start(msg);
  }
  if (text !== "/start") {
    CreateMessage(msg);
  }
});
