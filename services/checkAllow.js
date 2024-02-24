const GroupsList = require("../services/DBService").GroupsList;
const defaultPermissions = require("../constants/defaults/permissions");

class PermissionChecker {
  constructor() {
    this.groupsList = new GroupsList();
  }

  getGroupPermissions(chatId) {
    const groups = this.groupsList.readGroupsFile();
    const thisGroup = groups ? groups[chatId] : null;

    if (
      !thisGroup ||
      !thisGroup.rules ||
      !thisGroup.rules.permissions ||
      thisGroup.rules.permissions.length === 0
    ) {
      return [];
    }

    return thisGroup.rules.permissions;
  }

  async checkIfAdmin(bot, msg) {
    const chatAdmins = await bot.getChatAdministrators(msg.chat.id);

    if (!chatAdmins || chatAdmins.length === 0) {
      return false;
    }

    for (let i = 0; i < chatAdmins.length; i++) {
      if (chatAdmins[i].user.id === msg.from.id) {
        if (
          chatAdmins[i].status === "creator" ||
          (chatAdmins[i].status === "administrator" &&
            chatAdmins[i].can_restrict_members)
        ) {
          return true;
        }
        // Edge case
        if (chatAdmins[i].can_restrict_members) {
          return true;
        }
        return false;
      }
    }
    return false;
  }

  async checkAllowF(action, bot, chatId, msg) {
    const groupPermissions = this.getGroupPermissions(chatId);
    const defaultActionPermission = defaultPermissions[action];

    //console.log("groupPermissions", groupPermissions, "action", action);

    let isAdmin = await this.checkIfAdmin(bot, msg);

    if (groupPermissions[action]) {
      // Edge case. Prevents soft locking of permissions.
      if (groupPermissions[action] === "none" && action === "permissions") {
        return isAdmin;
      }

      if (groupPermissions[action] === "admin") {
        return isAdmin;
      } else if (groupPermissions[action] === "user") {
        return true;
      } else if (groupPermissions[action] === "none") {
        return false;
      }
    } else if (defaultActionPermission) {
      return defaultActionPermission === "admin" ? isAdmin : false;
    }

    return false;
  }

  async checkAllow(action, bot, chatId, msg) {
    const result = await this.checkAllowF(action, bot, chatId, msg);
    if (result) {
      return true;
    } else {
      await bot.sendMessage(chatId, "You don't have permission to do that.");
      return false;
    }
  }
}

module.exports = PermissionChecker;
