const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN_HR = process.env.TG_TOKEN_HR;
const bot = new TG_BOT(TG_TOKEN_HR, { polling: false }); //
module.exports = { bot };
require("./message");
