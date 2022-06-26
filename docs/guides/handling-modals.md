# Modals

**Table of Contents**
1. [Introduction](#introduction)
2. [Starting up](#starting-up)
3. [Making a modal](#making-a-modal)
4. [Caveats/Gotchas](#caveatsgotchas)
5. [What's next?](#whats-next)

## Introduction
Modals are a feature which allows you to display an input prompt to users, allowing them to easily and intuitively enter text into your bot. Modals will appear in the middle of the screen and interrupt the user, which is useful for commands which need immediate attention from the user.

## Starting up
This guide is using a basic bot setup, with only one simple command in the `commands.json` file. No command options are defined since all user input will come from the modal.

**commands.json**
```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json",

    "modal": {
        "description": "A basic command with a modal"
    }
}
```
**index.js**
```js
const { SlasherClient } = require("discord.js-slasher");
const client = new SlasherClient({ useAuth: true });

client.on("command", async ctx => {
    if(ctx.name === "modal") {
        // code goes here
    }
});

client.login();
```

## Making a modal
We start by creating the modal. We can add multiple text fields (referred to a text inputs) to the modal. These can be either a short (single line) input, or a long (paragraph) input.

Firstly we make the modal. The modal requires a custom ID and a title.

```js
const { Modal } = require("discord.js");
...

if(ctx.name === "modal") {
    let modal = new Modal()
        .setTitle("Test Modal")
        .setCustomId("test_modal");
}
```

Then we add our text inputs to the modal (up to 5).

```js
const { Modal, TextInputComponent, MessageActionRow } = require("discord.js");
...

if(ctx.name === "modal") {
    let modal = new Modal()
        .setTitle("Test Modal")
        .setCustomId("test_modal");

    let nameField = new TextInputComponent()
        .setLabel("What's your name?")
        .setPlaceholder("Name")
        .setCustomId("name")
        .setStyle("SHORT");
    let aboutField = new TextInputComponent()
        .setLabel("Tell us about yourself")
        .setPlaceholder("About you...")
        .setCustomId("about")
        .setStyle("PARAGRAPH");

    let nameRow = new MessageActionRow().addComponents(nameField);
    let aboutRow = new MessageActionRow().addComponents(aboutField);

    modal.addComponents(nameRow, aboutRow);
}
```

Lastly, using Slasher's context object we can show the modal. The function returns a promise which will resolve when the user submits their input. It will also throw an exception if the modal is never submitted (either because too much time passed or the user clicked out of the modal).

Once the response is recieved, we can use `resp.fields.getTextInputValue()` to access the text input which was entered by the user, from there you can do whatever you need!

```js
...
modal.addComponents(nameRow, aboutRow);

try {
    let resp = await ctx.modalResponse(modal);
    let name = resp.fields.getTextInputValue("name"); // matches customId of text field
    let about = resp.fields.getTextInputValue("about");
    await resp.reply(`You are ${name}! Bio: ${about}`);
} catch(e) {
    // depending on the command, it may be more appropriate to show nothing
    // if no input is entered
    await ctx.followUp("No input recieved :(");
}
```

There is an optional `timeout` parameter in `ctx.modalResponse()` which allows you to set a custom timeout interval for the modal submission. The default is 10 minutes.

```js
let resp = await ctx.modalResponse(modal, 5 * 60 * 1000); // 5 minutes
```

Keep in mind however that the time limit for all interactions on Discord is 15 minutes, setting it to be any longer than that will not allow interactions past that timeframe.

## Caveats/Gotchas
- Showing a modal counts as a reply to the original command interaction. This is why in the above example, we respond to the modal with `resp.reply()` instead of `ctx.reply()`. Not responding to the modal directly also causes the modal to not close automatically, and Discord to incorrectly assume the interaction failed.
  - This also means that `ctx.modalResponse()` can only be used once. There are other ways to show more than one modal, but in general you should try to collect all required information from the user in one modal.
  - This also means that in order to respond to the original command interaction for whatever reason (e.g. the modal response expiring), you must use `ctx.followUp()` to send a follow up message instead of directly replying.
- Don't be stupid and ask for information which you aren't supposed to have (e.g. passwords) or which would break Discord TOS.

## What's next?
- Learn how to [add command options](./adding-options.md)
- Read the original [discord.js modal guide](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals) to learn more