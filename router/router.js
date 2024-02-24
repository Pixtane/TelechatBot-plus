const MainController = require("../controllers/mainController");
const mainController = new MainController();

const GroupsList = require("../services/DBService").GroupsList;
let groupsList = new GroupsList();

const checkAllowClass = require("../services/checkAllow");
let check = new checkAllowClass();

async function router(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!text) {
    return;
  }

  let isMessageBanned = await mainController.checkMessage(
    bot,
    chatId,
    text,
    msg
  );

  if (isMessageBanned && !text.startsWith("/")) {
    await bot.deleteMessage(chatId, msg.message_id);
    return;
  }

  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    groupsList.addUserAndMessage(chatId, msg);
  }

  if (text.startsWith("/blockword")) {
    if (!(await check.checkAllow("blockword", bot, chatId, msg))) {
      return;
    }
    await bot.deleteMessage(chatId, msg.message_id);
    await mainController.blockWord(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/unblockword")) {
    if (!(await check.checkAllow("unblockword", bot, chatId, msg))) {
      return;
    }
    await bot.deleteMessage(chatId, msg.message_id);
    await mainController.unblockWord(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/blockedwords")) {
    await bot.deleteMessage(chatId, msg.message_id);
    await mainController.listBlockedWord(bot, chatId);
    return;
  }

  if (text.startsWith("/ban")) {
    if (!(await check.checkAllow("ban", bot, chatId, msg))) {
      return;
    }
    await mainController.banUser(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/unban")) {
    if (!(await check.checkAllow("unban", bot, chatId, msg))) {
      return;
    }
    await mainController.unbanUser(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/kick")) {
    if (!(await check.checkAllow("kick", bot, chatId, msg))) {
      return;
    }
    await mainController.kickUser(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/warns")) {
    await bot.deleteMessage(chatId, msg.message_id);
    await mainController.warnsStats(bot, chatId, text, msg);
    return;
  } else if (text.startsWith("/warn")) {
    if (!(await check.checkAllow("warn", bot, chatId, msg))) {
      return;
    }
    await mainController.warnUser(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/unwarn")) {
    if (!(await check.checkAllow("unwarn", bot, chatId, msg))) {
      return;
    }
    await mainController.unwarnUser(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/stats")) {
    await bot.deleteMessage(chatId, msg.message_id);
    await mainController.stats(bot, chatId, text);
    return;
  }

  if (text.startsWith("/start")) {
    await mainController.start(bot, chatId, msg);
    return;
  }

  if (text.startsWith("/help")) {
    await mainController.help(bot, chatId);
    return;
  }

  if (text.startsWith("/permissions")) {
    if (!(await check.checkAllow("permissions", bot, chatId, msg))) {
      return;
    }
    await mainController.addPermissions(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/listpermissions")) {
    await mainController.listPermissions(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/restrict")) {
    if (!(await check.checkAllow("restrict", bot, chatId, msg))) {
      return;
    }
    await mainController.restrict(bot, chatId, text, msg);
    return;
  }

  if (text.startsWith("/unrestrict")) {
    if (!(await check.checkAllow("unrestrict", bot, chatId, msg))) {
      return;
    }
    await mainController.unrestrict(bot, chatId, text, msg);
    return;
  }

  // Ідеологічно

  if (text === "Слава Україні!") {
    await bot.sendMessage(chatId, "Героям Слава!");
    return;
  }
  if (text === "Слава Нації!") {
    await bot.sendMessage(chatId, "Смерть Ворогам!");
    return;
  }
  if (text === "Україна") {
    await bot.sendMessage(chatId, "Понад усе!");
    return;
  }
}

module.exports = router;
