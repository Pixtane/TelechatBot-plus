const MainNoobController = require("../controllers/mainNoobController");
const mainNoobController = new MainNoobController();

async function noobRouter(bot, msg, action = "joined") {
  console.log(msg);

  if (action === "joined") {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const joinUsername = msg.new_chat_member.first_name;

    if (!msg.new_chat_member.is_bot) {
      await mainNoobController.greetings(bot, chatId, joinUsername);
    }
  } else if (action === "left") {
    console.log(msg.left_chat_member.first_name + " left the group");
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const leftUsername = msg.left_chat_member.first_name;

    if (!msg.left_chat_member.is_bot) {
      await mainNoobController.bye(bot, chatId, leftUsername);
    }
  }
}

module.exports = noobRouter;
