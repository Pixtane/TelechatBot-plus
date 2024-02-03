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
    }

    // Save the updated groups to the JSON file
    this.writeGroupsFile(groups);
  }
}

module.exports = {
  GroupsList,
};
