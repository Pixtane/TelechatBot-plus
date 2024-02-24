const TelegramBot = require("node-telegram-bot-api");
const router = require("./router/router");
const callbackRouter = require("./router/callbackRouter");
const noobRouter = require("./router/noobRouter");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;

async function botStart() {
  try {
    const bot = new TelegramBot(BOT_TOKEN, { polling: true }); 

    bot.on("message", async (msg) => await router(bot, msg));
    //bot.on("text", async (msg) => await router(bot, msg));
    bot.on("callback_query", async (data) => await callbackRouter(bot, data));
    bot.on("new_chat_members", async (msg) => await noobRouter(bot, msg));
    bot.on(
      "left_chat_member",
      async (msg) => await noobRouter(bot, msg, "left")
    );
  } catch (error) {
    console.log("BOT ERROR: ", error.status, error.message);
  }
}

botStart();
