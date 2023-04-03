# Upgrading an existing bot to Slasher

**Table of Contents**
1. [Introduction](#introduction)

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
const client = new SlasherClient({ useAuth: true });

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
    const responsePromise = i.awaitModalSubmit({ filter: i => i.customId === modal.data.custom_id });
});

// after
const responsePromise = ctx.modalResponse(modal);
```

## Step 2: Defining your commands

