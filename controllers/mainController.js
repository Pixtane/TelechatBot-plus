const HELP_REPLY_MARKUP = require("../constants/reply_markups/helpReplyMarkup");

module.exports = class MainController {
    async default(bot, chatId) {
        await bot.sendMessage(chatId, "Sorry, I don't understand you 🥲\n\nPlease try /help to see my commands whithin I work with!");
        return;
    }

    async start(bot, chatId) {
        await bot.sendMessage(chatId, "Hi! Thank you for using our Telegram Bot!");
        return;
    }

    async help(bot, chatId) {
        await bot.sendMessage(chatId, "1. Command to start - /start", { reply_markup: HELP_REPLY_MARKUP });
        await bot.sendMessage(chatId, "2. Command to get help - /help");
        return;
    }

    async giveBack(bot, chatId, text) {
        await bot.sendMessage(chatId, `You want to ban people with id ${text.split(" ")[1]}!`);
        return;
    }
}
