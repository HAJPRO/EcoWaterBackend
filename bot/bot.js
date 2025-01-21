const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN = process.env.TG_TOKEN;
const bot = new TG_BOT(TG_TOKEN, { polling: true }); //  hsash
module.exports = { bot };
require("./message.js");
