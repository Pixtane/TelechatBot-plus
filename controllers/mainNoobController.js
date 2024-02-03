module.exports = class MainNoobController {
  async greetings(bot, chatId, username) {
    if (!username) return;

    await bot.sendMessage(
      chatId,
      "*" + username + "* has joined our group.\n_Welcome!_",
      { parse_mode: "markdown" }
    );
    return;
  }

  async bye(bot, chatId, username) {
    if (!username) return;

    await bot.sendMessage(chatId, "*" + username + "* has left us.\n\n😭😭😭", {
      parse_mode: "markdown",
    });
    return;
  }
};
