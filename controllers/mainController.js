const GroupsList = require("../services/DBService").GroupsList;
let groupsList = new GroupsList();

const BanUserService = require("../services/BanUserService").BanUserService;
let banUserService = new BanUserService();

const helpText = require("../constants/infos/helpText");
const defaultPermissions = require("../constants/defaults/permissions");

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

  dayTimeToUnix(duration) {
    // Converts a duration string like 7d, 3w, 2m, 1y to a Unix timestamp
    const regex = /^(\d+)([dwmy])$/; // Regular expression to match the format of the duration string
    const match = duration.match(regex);

    if (!match) {
      throw new Error(
        "Invalid duration format. Please use the format like '10m', '4h', '3d', '2w', '6M', '1y'."
      );
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    const currentDate = new Date();
    let newUnixTime;

    switch (unit) {
      case "m":
        newUnixTime = amount * 60 * 1000;
        break;
      case "h":
        newUnixTime = amount * 60 * 60 * 1000;
        break;
      case "d":
        newUnixTime = amount * 24 * 60 * 60 * 1000;
        break;
      case "w":
        newUnixTime = amount * 7 * 24 * 60 * 60 * 1000;
        break;
      case "M":
        newUnixTime =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + amount,
            currentDate.getDate()
          ).getTime() - new Date().getTime();
        break;
      case "y":
        newUnixTime =
          new Date(
            currentDate.getFullYear() + amount,
            currentDate.getMonth(),
            currentDate.getDate()
          ).getTime() - new Date().getTime();
        break;
      default:
        throw new Error(
          "Invalid duration unit. Please use 'm', 'h', 'd', 'w', 'M', or 'y'."
        );
    }

    return newUnixTime;
  }

  async help(bot, chatId) {
    await bot.sendMessage(chatId, helpText, { parse_mode: "MarkdownV2" });
    return;
  }

  async banUser(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    await banUserService.banUser(bot, chatId, username, msg);
  }

  async unbanUser(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    await banUserService.unbanUser(bot, chatId, username, msg);
  }

  async kickUser(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    await banUserService.kickUser(bot, chatId, username, msg);
  }

  async warnUser(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    const reason = text.split(" ").slice(2).join(" ");
    await banUserService.warnUser(bot, chatId, username, reason, msg);
  }

  async unwarnUser(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    await banUserService.unwarnUser(bot, chatId, username, msg);
  }

  async stats(bot, chatId, text) {
    let messagesToday = groupsList.getGroupMessages(chatId);
    let args = text.split(" ");

    if (args.length >= 3) {
      try {
        let startDate = new Date(args[1]);
        let endDate = new Date(args[2]);
        messagesToday = groupsList.getGroupMessages(chatId, startDate, endDate);

        let messagesSum = 0;

        for (let key in messagesToday) {
          messagesSum += messagesToday[key];
        }

        await bot.sendMessage(
          chatId,
          `Total messages in range ${startDate.toDateString()} - ${endDate.toDateString()}: ` +
            messagesSum
        );

        return;
      } catch (error) {
        await bot.sendMessage(chatId, error.message);
        return;
      }
    }

    let messagesSum = 0;

    for (let key in messagesToday) {
      messagesSum += messagesToday[key];
    }
    await bot.sendMessage(chatId, "Total messages for today: " + messagesSum);
    return;
  }

  async warnsStats(bot, chatId, text, msg) {
    console.log("status");
    const username = text.split(" ")[1];
    await banUserService.warnsStatus(bot, chatId, username, msg);
  }

  async checkMessage(bot, chatId, text, msg) {
    return groupsList.checkMessage(chatId, text, msg);
  }

  async blockWord(bot, chatId, text) {
    const word = text.split(" ").slice(1).join(" ");
    groupsList.addBlockedWord(chatId, word);
    await bot.sendMessage(
      chatId,
      "Word " + word + " was added to the blocked list"
    );
  }

  async unblockWord(bot, chatId, text) {
    const word = text.split(" ").slice(1).join(" ");
    groupsList.removeBlockedWord(chatId, word);
    await bot.sendMessage(
      chatId,
      "Word " + word + " was removed from the blocked list"
    );
  }

  async listBlockedWord(bot, chatId) {
    const blockedWords = groupsList.listBlockedWords(chatId);

    if (!blockedWords) {
      await bot.sendMessage(chatId, "There are no blocked words in the group");
      return;
    } else if (blockedWords.length > 0) {
      let message = "Blocked words in the group: \n";
      for (let i = 0; i < blockedWords.length; i++) {
        message += blockedWords[i];
        if (i < blockedWords.length - 1) {
          message += ", \n";
        }
      }
      await bot.sendMessage(chatId, message);
    }
  }

  async listPermissions(bot, chatId, text, msg) {
    const permission = text.split(" ")[1];

    const allPermissions = await groupsList.getPermissions(chatId);

    if (permission) {
      if (!allPermissions[permission]) {
        if (!defaultPermissions[permission]) {
          await bot.sendMessage(
            chatId,
            "Wrong permission. Use: " +
              Object.keys(defaultPermissions).join(", ")
          );
          return;
        }
        await bot.sendMessage(chatId, permission + ": admin");
        return;
      } else {
        await bot.sendMessage(
          chatId,
          permission + ": " + allPermissions[permission]
        );
        return;
      }
    }

    console.log("allPermissions", allPermissions);

    if (!allPermissions || Object.keys(allPermissions).length === 0) {
      await bot.sendMessage(chatId, "There are no permissions in the group");
      return;
    } else {
      let message = "*Permissions in the group:*\n\n";
      Object.entries(allPermissions).forEach(([key, value]) => {
        console.log(key, value);
        message += `_${key}:_ ${value},\n`;
      });
      await bot.sendMessage(chatId, message, { parse_mode: "MarkdownV2" });
      return;
    }
  }

  async addPermissions(bot, chatId, text, msg) {
    //console.log("text", text);
    const permission = text.split(" ")[1];
    const status = text.split(" ")[2];

    if (!defaultPermissions[permission]) {
      await bot.sendMessage(
        chatId,
        "Wrong permission. Use: " + Object.keys(defaultPermissions).join(", ")
      );
      return;
    }

    if (status !== "admin" && status !== "user" && status !== "none") {
      await bot.sendMessage(
        chatId,
        "Wrong status '" +
          status +
          "'. Use admin, user or none. Write permission name first and status second."
      );
      return;
    }

    await groupsList.addPermission(chatId, permission, status);
    await bot.sendMessage(
      chatId,
      "Permission " +
        permission +
        " was added to the group with status " +
        status
    );
  }

  async restrict(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    let timefor = text.split(" ")[2];

    if (timefor) {
      timefor = new Date(new Date().getTime() + this.dayTimeToUnix(timefor));
      console.log(timefor);
    }
    await banUserService.restrict(bot, chatId, msg, username, timefor);
  }

  async unrestrict(bot, chatId, text, msg) {
    const username = text.split(" ")[1];
    let timefor = text.split(" ")[2];

    if (timefor) {
      timefor = new Date(new Date().getTime() + this.dayTimeToUnix(timefor));
      console.log(timefor);
    }

    await banUserService.unrestrict(bot, chatId, msg, username, timefor);
  }
};
