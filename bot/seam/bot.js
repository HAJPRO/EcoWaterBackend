const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN_SEAM = process.env.TG_TOKEN_SEAM;
const bot = new TG_BOT(TG_TOKEN_SEAM, { polling: true }); ///

module.exports = { bot };
require("../seam/message");
require("../seam/query");
