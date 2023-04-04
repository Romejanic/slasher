# Upgrading an existing bot to Slasher

**Table of Contents**
1. [Introduction](#introduction)
2. [Step 1: Updating your Client](#step-1-updating-your-client)
3. [Step 2: Defining your commands](#step-2-defining-your-commands)
4. [Step 3: Deploying your bot](#step-3-deploying-your-bot)
5. [What's next?](#whats-next)

## Introduction
If you have an existing discord.js bot, it will be very easy to upgrade it to Slasher! If you are not familiar with Slasher and how it works, please check out the [Getting Started](./getting-started.md) guide first so you can learn the basics of how Slasher works.

There are quite a few benefits to using Slasher which can help you simplify your bot's code quite a lot. Benefits of using Slasher include:

- Moving your command definitions to a separate file and out of your Javascript source code, making them far simpler and easier to read.
- Bot token loading is handled automatically when using Slasher's `auth.json` file, making it less likely for your token to be exploited.
- Each command interaction gives you a [CommandContext](../api/CommandContext.md) object, which provides a lot of useful shortcuts for commonly used data (e.g. channel permisions)

These benefits can allow for quite a lot of boilerplate code reduction, making it a lot easier to write your bot.

There are a couple of drawbacks to use Slasher which you will need workarounds to use, or which may not be supported at all. The main ones to consider are:

- Not all discord.js features have equivalent support in Slasher, and since I can only work on Slasher in my spare time it may take some time for it to catch up.
- Some command definition features (e.g. localization, newer option types) may not be supported by the `command.json` format.
- Sharding support has not been tested so I am not sure how well Slasher scales for larger bots.

However I believe these drawbacks are not enough to negate the benefits of using Slasher, and most of these issues will be resolved as Slasher is updated and brought up to parity with discord.js. With that said, let's get stuck into updating your bot to use Slasher!

## Step 1: Updating your `Client`
The [Client](https://discord.js.org/#/docs/discord.js/main/class/Client) is the main connection point between your bot and Discord's servers. In Slasher this is replaced with the [SlasherClient](../api/SlasherClient.md). This is an extension of the vanilla `Client` class which fires a special event when commands are sent, which is the basis of Slasher's benefits.

Start by replacing your `Client` instance with a `SlasherClient`.

**Before**
```js
const { Client, ClientEvents } = require("discord.js");

const client = new Client();
```

**After**
```js
const { ClientEvents } = require("discord.js");
const { SlasherClient, SlasherEvents } = require("discord.js-slasher");

const client = new SlasherClient();
```

There's a couple of main differences in how you define and use your `Client` instance. Since `SlasherClient` is an extension of the normal `Client`, any client options you pass to a vanilla discord.js `Client` are valid in `SlasherClient`. However, Slasher will add the `Guilds` intent automatically which is the minimum required intent to connect to Discord, so unless you are using extra intents you can remove this option.

Secondly, you do not pass your bot token directly into the `client.login()` function. Instead, you either pass it as an option to the client constructor, or use Slasher's authentication file to hold your token instead (this is discussed in more detail later). *This is the recommended approach for Slasher*, but you can still pass the token manually if required.

**Before**
```js
const token = "..."; // obtained from somewhere
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.login(token);
```

**After: No token (recommended)**
```js
const client = new SlasherClient();

client.login();
```

**After: With token**
```js
const token = "..."; // obtained from somewhere
const client = new SlasherClient({ token });

client.login();
```

Next, any pre-existing events on the vanilla `Client` will work as normal, but there is a new event for handling commands. You should use this rather than the regular `InteractionCreate` event, as this will pass a context object with a lot of useful information about the command interaction to cut down on boilerplate code.

Simply swap out your command handling event with the following:

**Before**
```js
client.on(Events.InteractionCreate, i => {
    if(!i.isChatInputCommand()) return;
    if(i.commandName === "test") {
        i.reply("Hello world!");
    }
});
```

**After**
```js
client.on(SlasherEvents.CommandCreate, ctx => {
    if(ctx.name === "test") {
        ctx.reply("Hello world!");
    }
});
```

The `ctx` object is NOT the same as the regular `ChatInputCommandInteraction` object, it provides extra information about the command ([see here](../api/CommandContext.md)). You can still access the original interaction by using `ctx.command` if needed.

That should be mostly everything, last step is there are a handful of slight differences when using the `CommandContext` object vs the original `ChatInputCommandInteraction`. Please refer to the [API reference](../api/CommandContext.md) for a full list, but these are the main ones:

- When using `ctx.reply()`, `ctx.edit()` or `ctx.followUp()` it will work as normal, but if you are responding with a single `EmbedBuilder` you can pass it directly into this method rather than requiring the `embeds` array (essentially how older versions of vanilla discord.js used to work).
```js
const embed = new EmbedBuilder()
    .setTitle("My response")
    .setDescription("Hello world!");

// before
i.reply({ embeds: [embed] });

// after
ctx.reply(embed);
```

- If you are sending an [ephemeral response](https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses) (i.e. only visible to the command sender and disappears after some time), you must now define it as an optional parameter to `ctx.reply()`, `ctx.defer()` or `ctx.followUp()`. This simplifies the code a lot and eliminates the need for a `MessagePayload` object unless you need to pass other options. This works with boths strings and embeds.
```js
// before
i.reply({ content: "Hello world", ephemeral: true });
i.reply({ embeds: [embed], ephemeral: true });

// after
ctx.reply("Hello world", true);
ctx.reply(embed, true);
```

- If you are showing a modal, there is a utility function which makes handling the responses far simpler. There is now a single `ctx.modalResponse()` function, which shows the modal and then returns a Promise which resolves when the user submits the modal, or rejects if the interaction times out.
```js
const modal = new ModalBuilder();
// ...construct modal and fields

// before
i.showModal(modal).then(() => {
    const responsePromise = i.awaitModalSubmit({
        filter: i => i.customId === modal.data.custom_id
    });
});

// after
const responsePromise = ctx.modalResponse(modal);
```

## Step 2: Defining your commands
Slasher uses a custom JSON file format to define Discord commands. This format is far easier to write and define than building the commands in code. To deploy the commands, you use the included `slasher` CLI utility to deploy it rather than it being redeployed when the bot runs. For a full guide on this file on this file [see here](./command-json.md).

Firstly make a `commands.json` file in the root of your project. The first thing you should add to this file is the JSON schema for Slasher, which will enable IDE autocomplete and validation of your command structure.

```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json"
}
```

If you are using the `SlashCommandBuilder` class to define your commands, you should be able to translate them to the new JSON format. Each command is defined as a JSON object, with things like descriptions and options defined as properties on the command object.

Here's a simple example of a command with a couple of options being translated to the new format. Handling the options in your code is identical (available with `ctx.options`).

**Before**
```js
const data new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user")
    .addUserOption(option =>
        option.setName("target")
            .setDescription("Which user to target")
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("reason")
            .setDescription("The reason for muting the user")
            .addChoices(
                { name: "Spam", value: "reason_spam" },
                { name: "Harassment", value: "reason_harassment" },
                { name: "Other", value: "reason_other" }
            )
    )
```

**After**
```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json",

    "mute": {
        "description": "Mute a user",
        "options": {
            "target": {
                "description": "Which user to target",
                "type": "user",
                "required": true
            },
            "reason": {
                "description": "The reason for muting the user",
                "choices": {
                    "Spam": "reason_spam",
                    "Harassment": "reason_harassment",
                    "Other": "reason_other"
                }
            }
        }
    }
}
```

As seen, the JSON format is far more concise than the vanilla equivalent using `SlashCommandBuilder`, and it is easier to read. It also does several things like option type inference to automatically detect the option type based on the context of some special properties (for example, the `reason` option is automatically infered to be a `string` property because all of the provided `choices` have string values). For more information about this, see the [commands.json format](./command-json.md) guide page.

To deploy these commands to Discord, simply use the Slasher CLI by running `npx slasher`. This will ask you to confirm the possible command list, and then to choose whether to deploy your commands to either a single server or globally. As with vanilla discord.js, you should deploy commands to a single server for quick testing, and globally when you are doing a release as global rollouts are much slower.

While running this CLI it will prompt you for your bot token, bot client ID and the server ID you want to deploy to. This will be saved to the `auth.json` file. This is used by both the CLI in future deployments and the bot client for logins so this file should be generated whenever you are deploying your bot. If you used the [suggested SlasherClient constructor](#step-1-updating-your-client), it will read from `auth.json` automatically.

As with any file containing sensitive data, this file **SHOULD NEVER EVER** be committed to your code repository. If your bot has a `.gitignore` file the Slasher CLI will add an entry for this file automatically, when it does you should commit that change so you cannot accidentally commit your bot token to the repo. If you're using a different source control system, add it to the respective ignore file.

Once all your commands are converted to the `commands.json` file, you can delete both your `SlashCommandBuilder`s and any code for deploying the commands using the `REST` API.

## Step 3: Deploying your bot
If you are deploying your bot manually, you should be able to run `npx slasher` manually to deploy your commands. Unless your commands change often, you won't need to redeploy your commands each time you deploy your bot.

```sh
$ git pull
$ npm install
$ npx slasher
```

Please watch this space as support for redeploying commands without manual intervention will be added in an upcoming version of Slasher.

## What's next?
Well done! Your bot should now be running on Slasher, and I hope you find it as useful for simplifying your bot as I do for my bots. I would suggest reading the following docs to get more familiar with Slasher:

- Learn about [the full command.js format](./command-json.md)
- Learn about [adding command options](./adding-options.md)
- Review the [SlasherClient](../api/SlasherClient.md) and [CommandContext](../api/CommandContext.md) API
- Review the [Getting Started](./getting-started.md) guide for a step by step guide of building a basic Slasher bot
- If you encounter any issues or have any ideas to improve Slasher, please [raise an issue](https://github.com/Romejanic/slasher/issues/new/choose)
