# Ephemeral Responses
[Ephemerals](https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses) are responses to a command interaction which is shown only to the user who initiated the command along with the message `Only you can see this` and is referred to as 'hidden' in the Slasher documentation. It allows for private messages to be given to a user without being direct messaged. Slasher's client works very similar to discord.js in it's implementation of ephemerals with a few small changes to function names due to the assumption of Slasher being used for command interactions.

## Main changes
|Discord.js|Slasher|
|----------|-------|
|`interaction.reply()`|`interaction.reply()`|
|`interaction.editReply`|`interaction.edit()`|
|`interaction.deferReply`|`interaction.defer()`|
|[isChatInputCommand](https://discord.js.org/#/docs/discord.js/main/class/BaseInteraction?scrollTo=isChatInputCommand)|`client.on("command", ...)`|

## Transitioning from Discord.js client to Slasher
### Basic Ephemeral
**Discord.js**
```js
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply({content: 'Hidden Pong!', ephemeral:true});
    }
});
```

**Slasher**
```js
client.on("command", async interaction => {
    // No need to check isChatInputCommand. We already know!
    if(interaction.name === 'ping') {
        await interaction.reply('Hidden Pong!', true); // No need to deal with objects either. All interaction responses have the options to be 'hidden' or ephemeral responses
    }
});
```

### Ephemeral with defered reply
**Discord.js**
```js
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.deferReply({ephemeral:true});

        // some long task

        await interaction.editReply({content: 'Task complete!', ephemeral:true});
    }
});
```

**Slasher**
```js
client.on("command", async interaction => {
    if(interaction.name === 'ping') {
        await interaction.defer(true); //Still has to be passed with the intention of being an ephemeral (hidden)
        
        // some long task

        await interaction.edit('Task complete!', true); // Make sure it's kept hidden
    }
});
```