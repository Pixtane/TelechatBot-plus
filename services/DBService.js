const fs = require("fs");
const path = require("path");

const GroupsListPath = path.resolve(__dirname, "../config/groups_list.json");

class GroupsList {
  readGroupsFile() {
    try {
      // Read the JSON file and parse its content
      const groupsData = fs.readFileSync(GroupsListPath, "utf8");
      return JSON.parse(groupsData);
    } catch (error) {
      // If the file doesn't exist or is invalid JSON, return an empty object
      return {};
    }
  }

  writeGroupsFile(groups) {
    // Write the groups object to the JSON file
    fs.writeFileSync(GroupsListPath, JSON.stringify(groups, null, 2), "utf8");
  }

  createGroup(groupId) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();

    // Check if a group with the given Id already exists
    if (!(groupId in groups)) {
      // If the group doesn't exist, create a new one and save it to the file
      groups[groupId] = {};

      // Save the updated groups to the JSON file
      this.writeGroupsFile(groups);

      console.log(`Group "${groupId}" created successfully.`);
      return 0;
    } else {
      console.log(`Group "${groupId}" already exists.`);
      return 1;
    }
  }

  addUserAndMessage(chatId, msg) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup) {
      if (!thisGroup.messages) {
        thisGroup.messages = {};
      }
      let date = new Date(msg.date * 1000).toDateString();
      thisGroup.messages[date] = thisGroup.messages[date]
        ? thisGroup.messages[date] + 1
        : 1;

      if (!thisGroup.users) {
        thisGroup.users = {};
      }
      let thisUser = {
        username: msg.from.username,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name,
        is_bot: msg.from.is_bot,
      };

      if (!thisGroup.users[msg.from.id]) {
        thisGroup.users[msg.from.id] = thisUser;
      } else {
        thisGroup.users[msg.from.id].username = msg.from.username;
        thisGroup.users[msg.from.id].first_name = msg.from.first_name;
        thisGroup.users[msg.from.id].last_name = msg.from.last_name;
        thisGroup.users[msg.from.id].is_bot = msg.from.is_bot;
      }
    }

    // Save the updated groups to the JSON file
    this.writeGroupsFile(groups);
  }

  getGroupMessages(chatId, startDate = new Date(), endDate = new Date()) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    // Initialize result object
    const result = {};

    // Loop through dates in the range
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dateString = currentDate.toDateString();

      if (thisGroup && thisGroup.messages && thisGroup.messages[dateString]) {
        result[dateString] = thisGroup.messages[dateString];
      }
    }

    return result;
  }

  findUserByUsername(users, username) {
    for (let id in users) {
      if (users[id].username === username) {
        return {
          id: id,
          username: users[id].username,
          first_name: users[id].first_name,
          last_name: users[id].last_name,
          is_bot: users[id].is_bot,
        };
      }
    }
    return null; // Return null if user not found
  }

  getUserByUsername(chatId, username) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    //remove @ from username
    username = username.replace("@", "");

    if (thisGroup && thisGroup.users) {
      let user = this.findUserByUsername(thisGroup.users, username);

      return user;
    }
  }

  warnUser(chatId, userId, reasonGiven) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && thisGroup.users) {
      let user = thisGroup.users[userId];

      if (user) {
        if (!user.warns) {
          user.warns = [];
        }

        let newWarn = {
          date: new Date(),
          reason: reasonGiven,
        };

        user.warns.push(newWarn);

        // Save the updated groups to the JSON file
        this.writeGroupsFile(groups);
        return user.warns.length;
      }
    }
    return 0;
  }

  unwarnUser(chatId, userId) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && thisGroup.users) {
      let user = thisGroup.users[userId];

      if (user) {
        user.warns = [];
      }
    }
    this.writeGroupsFile(groups);
    return 0;
  }

  warnsStatus(chatId, userId) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && thisGroup.users) {
      if (userId) {
        let user = thisGroup.users[userId];
        return user;
      }
      return thisGroup.users;
    }
  }

  checkMessage(chatId, text, msg) {
    if (!text) {
      return 0;
    }
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (!thisGroup) {
      return 1;
    }

    let rules = thisGroup.rules;
    if (!rules) {
      rules = {
        bannedWords: [],
      };
    }

    if (thisGroup && thisGroup.messages) {
      let bannedWords = rules.bannedWords;

      for (let i = 0; i < bannedWords.length; i++) {
        if (text.includes(bannedWords[i])) {
          console.log("FAILED CHECK", text, bannedWords[i]);
          return 1;
        }
      }
      return 0;
    }
  }

  async getPermissions(chatId) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && thisGroup.rules) {
      return thisGroup.rules.permissions;
    }
  }

  addBlockedWord(chatId, blockedWord) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && !thisGroup.rules) {
      thisGroup.rules = {
        bannedWords: [blockedWord],
      };
      this.writeGroupsFile(groups);
    } else if (thisGroup && thisGroup.rules) {
      if (!thisGroup.rules.bannedWords) {
        thisGroup.rules.bannedWords = [];
      }

      if (!thisGroup.rules.bannedWords.includes(blockedWord)) {
        thisGroup.rules.bannedWords.push(blockedWord);
      }
      this.writeGroupsFile(groups);
    }
  }

  removeBlockedWord(chatId, blockedWord) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && !thisGroup.rules) {
      return 1;
    } else if (thisGroup && thisGroup.rules) {
      if (!thisGroup.rules.bannedWords) {
        return 1;
      }

      if (thisGroup.rules.bannedWords.includes(blockedWord)) {
        thisGroup.rules.bannedWords = thisGroup.rules.bannedWords.filter(
          (word) => word !== blockedWord
        );
      }
      this.writeGroupsFile(groups);
    }
  }

  listBlockedWords(chatId) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && thisGroup.rules) {
      return thisGroup.rules.bannedWords;
    }
  }

  addPermission(chatId, permission, status) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    let rules = thisGroup.rules;
    if (!rules) {
      rules = {
        bannedWords: [],
        permissions: {
          [permission]: status,
        },
      };
    }
    if (!rules.permissions) {
      rules.permissions = {
        [permission]: status,
      };
    }
    thisGroup.rules.permissions[permission] = status;

    this.writeGroupsFile(groups);
  }
}

module.exports = {
  GroupsList,
};
