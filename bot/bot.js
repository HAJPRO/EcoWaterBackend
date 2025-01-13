const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN = "8153188682:AAHpWAks8N8RPOdg2jdN_SQGsRGWjL0yzK8";
const bot = new TG_BOT(TG_TOKEN, { polling: false });
module.exports = { bot };
require("./message.js");
