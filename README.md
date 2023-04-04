<!-- header template -->
<br />
<p align="center">
  <a href="https://github.com/Romejanic/slasher">
    <img src="docs/logo.png" alt="Logo" height="80">
  </a>

  <p align="center">
    Frighteningly simple slash commands
    <br />
    <a href="https://github.com/Romejanic/slasher/blob/master/docs/README.md">Documentation »</a>
    <br />
    <br />
    <a href="https://github.com/Romejanic/slasher/issues/new?assignees=Romejanic&labels=bug&template=bug_report.md&title=">Report Bug</a>
    ·
    <a href="https://github.com/Romejanic/slasher/issues/new?assignees=Romejanic&labels=enhancement&template=feature_request.md&title=">Request Feature</a>
  </p>
</p>

Slasher is a framework to simplify the creation of Discord bots.

Forget about `SlashCommandBuilder` and `REST`. Slasher takes care of all of it for you, and provides a simple, easy-to-use interface to build your bot using slash commands.

Even if you're not using discord.js to build your bot, you can still make use of the handy CLI tool to make adding slash commands painless!

### Slasher currently supports discord.js v14 ONLY. The package will no longer work with v13.

## Guides
**If you are using Slasher for the first time, please see the [Getting Started](./docs/guides/getting-started.md) guide.**

**If you are migrating an existing bot, please see the [Slasher Migration](./docs/guides/upgrading-to-slasher.md) guide.**

## Install
Install for use in a node project
```sh
npm i -s discord.js discord.js-slasher
```

Install the CLI tool for another language
```sh
npm i -g discord.js-slasher
```

## Example
First we create our `commands.json` definition file:
```json
{
    "test": {
        "description": "My first command on Discord!"
    }
}
```
Then run the `slasher` utility and follow the prompts to upload it to Discord!
```sh
$ slasher
```
Then we can create our bot!
```js
const { Events } = require("discord.js");
const { SlasherClient, SlasherEvents } = require("discord.js-slasher");
// alternatively use import statements

const client = new SlasherClient({ useAuth: true });

client.on(Events.ClientReady, () => {
    console.log("Logged in as " + client.user.tag);
});

client.on(SlasherEvents.CommandCreate, (ctx) => {
    ctx.reply(`Howdy ${ctx.user.tag}!`);
});

client.login();
```

## Thanks
- [othneildrew](https://github.com/othneildrew/) for the [header template](https://github.com/othneildrew/Best-README-Template)