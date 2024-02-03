const MainController = require("../controllers/mainController");
const mainController = new MainController();

const GroupsList = require("../services/DBService").GroupsList;
let groupsList = new GroupsList();

async function router(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    groupsList.addUserAndMessage(chatId, msg);
  }

  if (text && text.startsWith("/ban")) {
    await mainController.banUser(bot, chatId, text, msg);
    return;
  }

  if (text && text.startsWith("/unban")) {
    await mainController.unbanUser(bot, chatId, text, msg);
    return;
  }

  switch (text) {
    case "/start":
      await mainController.start(bot, chatId, msg);
      return;

    case "/help":
      await mainController.help(bot, chatId);
      return;

    case "💸":
      await bot.sendMessage(chatId, "🚫 🧠");
      return;

    default:
      await bot.sendMessage(chatId, JSON.stringify(msg));
      //await mainController.default(bot, chatId);
      return;
  }
}

module.exports = router;
