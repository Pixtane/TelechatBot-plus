const GroupsList = require("../services/DBService").GroupsList;
let groupsList = new GroupsList();

const restrictionsDefaults = require("../constants/defaults/restrictions");
const restrictionsDefaultsRestricted = require("../constants/defaults/restrictionsrestricted");

class BanUserService {
  async banUser(bot, chatId, username, msg) {
    const BanUID = await this.getUserId(bot, username, chatId, msg);
    if (!BanUID) return;

    console.log("Banning user in Service with ID: ", typeof BanUID, BanUID);

    try {
      await bot.banChatMember(chatId, BanUID);
      await bot.sendMessage(chatId, `User ${username} banned`);
    } catch (error) {
      await this.handleError(chatId, error);
    }
  }

  async unbanUser(bot, chatId, username, msg) {
    const UnBanUID = await this.getUserId(bot, username, chatId, msg);

    console.log(
      "Unbanning user in Service with ID: ",
      typeof UnBanUID,
      UnBanUID
    );

    try {
      await bot.unbanChatMember(chatId, UnBanUID);
      await bot.sendMessage(
        chatId,
        `User ${username ? username : UnBanUID} unbanned`
      );
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async kickUser(bot, chatId, username, msg) {
    const KickUID = await this.getUserId(bot, username, chatId, msg);

    console.log("Kicking user in Service with ID: ", typeof KickUID, KickUID);

    try {
      await bot.banChatMember(chatId, KickUID); // Bad but IDK how to do differently (still works)
      await bot.unbanChatMember(chatId, KickUID);
      await bot.sendMessage(
        chatId,
        `User ${username ? username : KickUID} kicked`
      );
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async warnUser(bot, chatId, username, reason, msg) {
    const WarnUID = await this.getUserId(bot, username, chatId, msg);

    console.log("Warning user in Service with ID: ", typeof WarnUID, WarnUID);

    try {
      let warnCount = groupsList.warnUser(chatId, WarnUID, reason);

      if (warnCount > 3) {
        await bot.banChatMember(chatId, WarnUID);

        await bot.sendMessage(
          chatId,
          `User ${username ? username : WarnUID} was banned.\n` +
            `Warn limit exceeded!`
        );
      } else {
        await bot.sendMessage(
          chatId,
          `User ${username ? username : WarnUID} warned\n` +
            `This is ${warnCount}/3 warn.`
        );
      }
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async unwarnUser(bot, chatId, username, msg) {
    const WarnUID = await this.getUserId(bot, username, chatId, msg);

    console.log("Unwarning user in Service with ID: ", typeof WarnUID, WarnUID);

    try {
      groupsList.unwarnUser(chatId, WarnUID);
      await bot.sendMessage(
        chatId,
        `User ${username ? username : WarnUID} unwarned and now has 0 warns.`
      );
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async restrict(bot, chatId, msg, username, timefor) {
    const RestrictUID = await this.getUserId(bot, username, chatId, msg);

    try {
      console.log("restricting", RestrictUID);
      await bot.restrictChatMember(chatId, RestrictUID, {
        ...restrictionsDefaultsRestricted,
        until_date: timefor ? timefor.getTime() : 0,
      });

      await bot.sendMessage(
        chatId,
        `User ${username ? username : RestrictUID} restricted\n`
      );
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async unrestrict(bot, chatId, msg, username, timefor) {
    const UnrestrictUID = await this.getUserId(bot, username, chatId, msg);

    try {
      console.log("unrestricting", UnrestrictUID);
      await bot.restrictChatMember(
        chatId,
        UnrestrictUID,
        restrictionsDefaults,
        true,
        timefor ? timefor.getTime() : null
      );

      await bot.sendMessage(
        chatId,
        `User ${username ? username : UnrestrictUID} unrestricted\n`
      );
    } catch (error) {
      await this.handleError(bot, chatId, error);
    }
  }

  async warnsStatus(bot, chatId, username, msg) {
    let WarnUID;
    if (username) {
      WarnUID = await this.getUserId(bot, username, chatId, msg);
    }

    if (!WarnUID) {
      // For all group
      let result = await groupsList.warnsStatus(chatId, null);

      if (result) {
        // Makes a message
        let message = `*Warns status* for _all_ users in ${msg.chat.title}:\n`;

        for (let id in result) {
          if (result[id].warns && result[id].warns.length > 0) {
            let firstname = result[id].first_name ? result[id].first_name : "";
            let surname = result[id].last_name ? result[id].last_name : "";
            let name = firstname + " " + surname;
            message += `\n*${name}:* ${result[id].warns.length} warns \n`;

            let i = 0;

            for (let warnInfo in result[id].warns) {
              console.log(warnInfo);
              i++;
              message += `${i}: ${new Date(
                result[id].warns[warnInfo].date
              ).toDateString()}`;
              let reason = result[id].warns[warnInfo].reason;
              if (reason) {
                message += `\nReason: ${reason}\n`;
              } else {
                message += "\n";
              }
            }
          }
        }

        await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      }
    } else {
      let result = await groupsList.warnsStatus(chatId, WarnUID);

      if (result) {
        // Makes a message
        let message = `*Warns status* for ${username} in ${msg.chat.title}:\n`;

        if (result.warns) {
          let name = result.first_name + " " + result.last_name;
          message += `\n*${name}:* ${result.warns.length} warns \n`;

          let i = 0;

          for (let warnInfo in result.warns) {
            console.log(warnInfo);
            i++;
            message += `${i}: ${new Date(
              result.warns[warnInfo].date
            ).toDateString()}`;
            let reason = result.warns[warnInfo].reason;
            if (reason) {
              message += `\nReason: ${reason}\n`;
            } else {
              message += "\n";
            }
          }
        } else {
          message += "\n None";
        }

        await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      }
    }
  }

  async getUserId(bot, username, chatId, msg) {
    if (!username) {
      if (!msg.reply_to_message) {
        await bot.sendMessage(
          chatId,
          "Please, reply to the message you want to ban user of"
        );
        return null;
      }
      return msg.reply_to_message.from.id;
    }

    let userToBan = msg.entities[1];
    if (userToBan.user) {
      userToBan = userToBan.user;
    }
    let BanUID = userToBan.id;

    if (!BanUID) {
      const userOBJ = await groupsList.getUserByUsername(chatId, username);
      if (userOBJ) {
        BanUID = userOBJ.id;
      } else {
        await bot.sendMessage(
          chatId,
          "Error banning!\n" +
            "Unfortunately user haven't written any messages yet and it is impossible to ban him using this bot.\n" +
            "If he did write messages, you could respond to them with '/ban' and it should work."
        );
        return null;
      }
    }
    return BanUID;
  }

  async handleError(bot, chatId, errorGiven) {
    try {
      await bot.sendMessage(
        chatId,
        "ERROR: " + (error.message ? error.message : "Unknown error")
      );
    } catch (error) {
      console.log("Unknown error: \x1b[31m ", errorGiven, " \x1b[0m");
      //await bot.sendMessage(chatId, "ERROR: " + JSON.stringify(error));
    }
  }
}

module.exports = {
  BanUserService,
};
