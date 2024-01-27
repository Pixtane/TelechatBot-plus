const MainController = require('../controllers/mainController');
const mainController = new MainController();

async function router(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (text.startsWith("/ban")) {
        await mainController.giveBack(bot, chatId, text);
        return;
    }

    switch (text) {
        case "/start":
            await mainController.start(bot, chatId);
            return;
        
        case "/help":
            await mainController.help(bot, chatId);
            return;

        case "💸":
            await bot.sendMessage(chatId, "🚫 🧠");
            return;

        default:
            await mainController.default(bot, chatId);
            return;
    }
}

module.exports = router;
