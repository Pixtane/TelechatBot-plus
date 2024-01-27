module.exports = class MainCallbackController {
    async default(bot, chatId, callbackData) {
        await bot.sendMessage(chatId, callbackData + '');
        return;
    }
}
