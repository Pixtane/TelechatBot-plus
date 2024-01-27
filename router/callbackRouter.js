const MainCallbackController = require('../controllers/mainCallbackController');
const mainCallbackController = new MainCallbackController();

async function callbackRouter(bot, data) {
    const chatId = data.message.chat.id;
    const userId = data.from.id;
    const callbackData = data.data;

    switch (callbackData) {
        default:
            await mainCallbackController.default(bot, chatId, callbackData);
            return;
    }
}

module.exports = callbackRouter;
