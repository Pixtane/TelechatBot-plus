# Configuration

Make a file called .env in base directory and write in it:

`BOT_TOKEN=bot_token`

Then install all necessary node modules with:

`npm i`

And start:

`npm start`

# Commands

**`/start`** Start the bot. To make it work without errors put it in group and make it administrator.

**`/ban`** Ban user. To use it you must be able to do it yourself. Use by replying to message of user you want to ban of, or write `/ban @` and choose the user you want to ban. It won't work if the user never wrote anything after the bot joined.

**`/unban`** Unban the user. Same rules as for `/ban`.

**`/kick`** Kicks user from group. Same rules as for `/ban` or `/unban`.

**`/help`** Get help

**`/stats`** Get stats for today. To get stats for a period of time write start date and end date after stats. Currently only shows how many messages were sent. 

**Example usage**: `/stats 01.01.2024 09.02.2024`: *Total messages in range Mon Jan 01 2024 - Mon Sep 02 2024: 30*