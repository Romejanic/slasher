# Upgrading to 1.0.0 and discord.js v14

**Table of Contents**
1. [Intro](#intro)
2. [First steps](#first-steps)
3. [Further differences](#further-differences)

## Intro
This guide will walk through how to upgrade a bot written with a beta version of Slasher (v 0.x.x) using discord.js v13. Slasher is now in stable release and has been upgraded to use discord.js v14. Because of the major API changes between v13 and v14, Slasher is __no longer compatible__ with v13, just as all beta versions were not compatible with v14.

### Will Slasher stop installing the wrong discord.js version now?
 As you may have noticed, newer installs of Slasher often install the wrong discord.js version. discord.js v14 is now a peer dependency, so it will ensure that there are no version incompatabilities when using Slasher, even if another major release of discord.js happens. However this means you will need to upgrade your bots to use discord.js v14 to continue using Slasher (which is my recommendation).

### Can I stay on a beta version of slasher?
I would not advise staying on a beta version of Slasher. This is simply because only v1.0.0 and onwards are considered truly "stable" so there may be bugs and issues. You will also encounter the version discrepencies with discord.js mentioned above.

## First steps
The first steps in updating your bot is updating your packages. You should be able to do this in your project by running:
```sh
$ npm i -s discord.js@14 discord.js-slasher
```
This will reinstall both discord.js and Slasher on the latest, correct major releases.

### Updating the Slasher code
The Slasher API has mostly remained the same. The main differences are the following:

### SlasherEvents
When defining your command listener, in order to align with the conventions set up by discord.js v14, there is a new enum type called [SlasherEvents](../api/SlasherEvents.md) which will contain entries for each valid client event on the [SlasherClient](../api/SlasherClient.md) class. To align with the new standards, you should update your command listener to match.

**Before**
```js
const { SlasherClient } = require("discord.js-slasher");
/// ...

client.on("command", async (ctx) => {
    await ctx.reply("Hello world!");
});
```

**After**
```js
const { SlasherClient, SlasherEvents } = require("discord.js-slasher");
/// ...

client.on(SlasherEvents.CommandCreate, async (ctx) => {
    await ctx.reply("Hello world!");
});
```

### Command permissions
Due to some internal changes, the command permission values in your `commands.json` file have been changed from v13's `SCREAMING_SNAKE_CASE` to v14's `PascalCase`. For example, `MANAGE_GUILD` is now `ManageGuild`. You'll have to go through your `commands.json` file and update each permission to match. See [Permissions](../guides/command-json.md#permissions) for more a full list of the new permissions.

**Before**
```json
"clean": {
    "description": "Cleans up the channel's messages.",
    "permissions": {
        "requires": [
            "MANAGE_CHANNELS",
            "MANAGE_MESSAGES"
        ]
    }
}
```

**After**
```json
"clean": {
    "description": "Cleans up the channel's messages.",
    "permissions": {
        "requires": [
            "ManageChannels",
            "ManageMessages"
        ]
    }
}
```
The json schema has been updated so your IDE should highlight these as warnings if you are using the latest schema version. If yours is out of date, you can run `JSON: Clear Schema Cache` in Visual Studio Code to refetch it.

### `Command` alias type
The `Command` alias type has been removed. If you make any reference to it in your code, please replace it with a reference to [ChatInputCommandInteraction](https://discord.js.org/#/docs/discord.js/main/class/ChatInputCommandInteraction) from discord.js' API. Since `Command` was an alias type, this removal should only affect TypeScript code.

**Before**
```ts
import { Command } from 'discord.js-slasher';

function process(cmd: Command) {
    // do something
}
```

**After**
```ts
import { ChatInputCommandInteraction } from 'discord.js';

function process(cmd: ChatInputCommandInteraction) {
    // do something
}
```

## Further differences
That's all the differences in Slasher's API. However there are far more differences in discord.js itself. You'll have to go through your codebase and update any vanilla discord.js code which is now out of date.

Your IDE should be able to tell you where the changes will need to be made. If you use Typescript or a module bundler that will also tell you any errors when you try to build so you have a list of required changes.

For a full list of differences please see the [Upgrading from v13 to v14](https://discordjs.guide/additional-info/changes-in-v14.html) page on the discord.js guide. There you will get an itemised list of every change made in v14.

However, here's a brief list of the most common issues you'll likely encounter.

### Common issues
- Embeds, Components and Modals now all use builders. In most cases this will just involve a class name change, but some deprecated functions in v13 have been removed so you might need to juggle a few function calls. e.g.
    - `MessageEmbed` -> `EmbedBuilder`
    - `MessageButton` -> `ButtonBuilder`
    - `MessageActionRow` -> `ActionRowBuilder`
    - `Modal` -> `ModalBuilder`
    - `TextInputComponent` -> `TextInputBuilder`
    - `embed.setFooter()` -> `embed.setFooters()`
- Similar to Slasher, vanilla client events are contained within a new `Events` enum. You should update your client events to use this new enum. e.g.
    - `client.on("ready", ...)` -> `client.on(Events.ClientReady, ...)`
    - `client.on("guildDelete", ...)` -> `client.on(Events.GuildDelete, ...)`
    - `client.on("reactionAdd", ...)` -> `client.on(Events.ReactionAdd, ...)`
- Most constant values are replaced with enums and constants. Similar to command permissions they are also now all defined in `PascalCase` rather than `SCREAMING_SNAKE_CASE`. There are a few different ones to be aware of, such as:
    - Permissions: `PermissionFlagBits`
    - Intents: `IntentFlagBits`
    - Partials: `Partials`
