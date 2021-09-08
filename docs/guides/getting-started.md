# Getting started
Welcome! You're on your way to creating your first Discord bot with Slasher!

Let's start with a little bit about what to expect:

* Slasher is mainly two things: a command line tool and a library
* Slasher is an *abstraction layer* which sits on top of discord.js, it is **NOT** a replacement for discord.js
* You should still have a thorough knowledge of discord.js and how to use it. In fact, knowledge of how to use slash commands with vanilla discord.js would be preferable (maybe to increase appreciation for Slasher :P)
* At the time of writing, this package is a beta at the most. It is still fairly early in development, and you may encounter bugs or other unexpected behaviour. If anything happens, please [report it](https://github.com/Romejanic/slasher/issues/new/choose) so this package can become as awesome as possible :D

**You will need**
- [A bot application](https://discord.com/developers/applications)
- A latest [node.js](https://nodejs.org/en/) installation
- A Discord server for testing

**When inviting your bot** make sure it has the `bot` and `applications.commands` scopes, otherwise you won't be able to update the commands! ([see here](img/scopes.png))

Finally we can get into programming!

## Install the package
The first step is always to add the package to your project. This can be done with your package manager of choice. With npm, you type:
```sh
$ npm i -s discord.js discord.js-slasher
```

While Slasher depends on the `discord.js` package I'd still recommend that you add `discord.js` to your dependencies separately, in case (for whatever reason) you decide to stop using Slasher.

## Create your command file
With Slasher, all of your commands will be defined in the `commands.json` file in the root directory of your project. Go ahead and create it now.

The first thing you'll want to do is add this template:
```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json"
}
```

The `$schema` property defines the URL of the JSON Schema for this file. With this property present, using an IDE like Visual Studio Code will provide auto-completion and suggestions based on the specification of the `commands.json` file.

To add a command, you just create a new object property in this file with your command's name!
```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json",

    "test": {}
}
```

This will create the `/test` command in Discord! However for this command to be valid, you must add a `description` for the command (which will appear underneath the command in Discord).
```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json",

    "test": {
        "description": "My very first command!"
    }
}
```

You now have everything you need to make your first command!

## Run the slasher utility
Installing the slasher package also adds a new command line tool to your workspace. This utility is responsible for validating the `commands.json` file and then updating the data on Discord's end.

You can run this utility by simply opening a terminal in your project's folder and running:
```sh
$ slasher
```

Sometimes on Windows it may not work correctly. If this happens to you, try running this instead:
```sh
$ npx slasher
```

You will see this output in the terminal, with a list of the commands:
![Command list](img/gs-1.png)

Enter `y` to proceed. You will then be asked if you'd like to upload the commands for a specific server or globally.
![Choice of server or global](img/gs-2.png)

**For immediate testing** you should choose option 1, as it updates quickly.

**When deploying your bot** you should choose option 2, as it takes a lot longer but updates the commands on all servers.

For now just choose `1` so it updates on your server.

The first time you run the utility you will also be prompted to enter your bot's token, client ID and the server ID you'd like to update. Therefore you will need to copy the IDs from Discord, and the token from your bot's application page ([how do I do this?](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)).

After you enter them into Slasher you'll get a prompt to save the details for future use.
![Prompt](img/gs-3.png)

**To save time in future,** you should enter `y`. This will create an `auth.json` file in the root of your project, and add an entry for it to your `.gitignore` file.

***!!! IMPORTANT !!!***
If you Git, make sure you **do not** remove the entry from your gitignore file.

If you do not use Git, make sure you **add an entry** to your version control system's ignore file.

**YOU CAN NEVER, EVER, EVER, EVER, EVER COMMIT THIS FILE TO YOUR REPOSITORY!!!!**

Doing so would make your bot token public!! This means that anyone who stumbles upon your repository can take your token and use it to impersonate your bot. Even if you delete it later, it can still be accessible to them through past commits, forcing you to regenerate it in your developer portal. So do yourself a favour and **NEVER** commit this file. And if you don't use Git, add it to your project's ignore file RIGHT NOW.

Anyway, once you have agreed to this, it will prompt you that your commands will now be updated for the server!
![Final prompt](img/gs-4.png)

In order to update your commands on Discord, just type `y`! If all is well, you should recieve this prompt!
![Done](img/gs-5.png)

If you go to Discord and type `/test` into a text channel, you should see your new command! Hooray!
![Command](img/gs-6.png)