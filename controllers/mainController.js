const HELP_REPLY_MARKUP = require("../constants/reply_markups/helpReplyMarkup");

const GroupsList = require("../services/DBService").GroupsList;
let groupsList = new GroupsList();

module.exports = class MainController {
  async default(bot, chatId) {
    await bot.sendMessage(
      chatId,
      "Sorry, I don't understand you 🥲\n\nPlease try /help to see my commands whithin I work with!"
    );
    return;
  }

  async start(bot, chatId, msg) {
    await bot.sendMessage(chatId, "Hi! Thank you for using our Telegram Bot!");
    //console.log("started msg", msg);
    if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
      let result = await groupsList.createGroup(msg.chat.id);
      if (result === 1) {
        await bot.sendMessage(
          chatId,
          "Group already exists. Group type is " + msg.chat.type
        );
      } else {
        await bot.sendMessage(
          chatId,
          "Group created successfully. Group type is " + msg.chat.type
        );
      }
    }
    return;
  }

  async help(bot, chatId) {
    await bot.sendMessage(chatId, "1. Command to start - /start", {
      reply_markup: HELP_REPLY_MARKUP,
    });
    await bot.sendMessage(chatId, "2. Command to get help - /help");
    return;
  }

  async banUser(bot, chatId, text, msg) {
    let username = text.split(" ")[1];

    if (!msg.reply_to_message) {
      await bot.sendMessage(
        chatId,
        "Please, reply to the message you want to ban user of"
      );
      return;
    }

    let BanUID = msg.reply_to_message.from.id;

    try {
      await bot.banChatMember(chatId, BanUID);
    } catch (error) {
      await bot.sendMessage(chatId, error.message);
      return;
    }
    await bot.sendMessage(
      chatId,
      `User ${username ? username : BanUID} banned`
    );

    return;
  }

  async unbanUser(bot, chatId, text, msg) {
    let username = text.split(" ")[1];

    // if (username) {
    //   let chatMSg = await bot.getChatMember(chatId, username);
    //   chatMSg.catch((err) => console.log(err.body));
    //   await bot.sendMessage(chatId, JSON.stringify(chatMSg));
    // }

    if (!msg.reply_to_message) {
      await bot.sendMessage(
        chatId,
        "Please, reply to the message you want to unban user of"
      );
      return;
    }

    let chatMSg = await bot.getChat(chatId);

    await bot.sendMessage(chatId, JSON.stringify(chatMSg));

    let UnBanUID = msg.reply_to_message.from.id;

    try {
      await bot.unbanChatMember(chatId, UnBanUID);
    } catch (error) {
      await bot.sendMessage(chatId, error.message);
      return;
    }
    await bot.sendMessage(
      chatId,
      `User ${username ? username : UnBanUID} unbanned`
    );

    return;
  }
};
