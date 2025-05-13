const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN_ORDER = process.env.TG_TOKEN_ORDER;
const bot = new TG_BOT(TG_TOKEN_ORDER, { polling: true }); /////

module.exports = { bot };
require("../drivers/message");

require("../drivers/query");