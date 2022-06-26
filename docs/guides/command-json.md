# command.json format

**Table of Contents**
1. [Schema](#schema)
2. [Basic Commands](#basic-commands)
3. [Commands with options](#commands-with-options)
    1. [Types](#types)
    2. [Required Options](#required-options)
    3. [Choices](#choices)
    4. [Channel Types](#channel-types)
    5. [Min/Max Values](#minmax-values)
4. [Subcommands](#subcommands)
5. [Subcommand Groups](#subcommand-groups)
6. [Permissions](#permissions)
7. [What's next?](#whats-next)

## Schema
For all `commands.json` files, you should include a `$schema` property to provide auto-complete and suggestions for your file, which will greatly improve your productivity and reduce your proneness to errors.

```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json"
}
```

The examples in this file will not include the `$schema` property, but you should keep in mind that it should always be present above your command definitions.

## Basic Commands
Adding a basic command is dead simple. All you need is to provide a description for the command.
```json
{
    "command": {
        "description": "A brief, concise description of the command"
    }
}
```

This will result in a command like `/command`, with no additional arguments.

## Commands with options
Commands can also have up to 25 options. These are defined in the `options` property of your command. The order of the options in Discord is the same as they are defined in the file.

```json
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "param": {
                "description": "A regular option",
                "type": "string"
            }
        }
    }
}
```

### Types
When you create an option, you must provide a `description` (same as commands). You must also provide a `type` (unless you have `choices` or `channel_types` defined).

Valid types are: `string`, `integer`, `number`, `boolean`, `user`, `channel`, `role` or `mentionable`.

|Type|Description|
|----|-----------|
|string|A string of text|
|integer|An integer value, only whole numbers can be entered|
|number|An double number value, numbers with decimals can be entered|
|boolean|A single true or false value|
|user|Allows them to select a user to act on|
|channel|Allows them to select a channel to act on|
|role|Allows them to select a role to act on|
|mentionable|Allows you to select a mentionable target (i.e. user or role)|

### Required Options
You can also mark an option as `required`, which means it is mandatory for the user to include these options, and Discord will not allow the user to send the command unless they include them.

```json
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "param": {
                "description": "A regular option which is required",
                "type": "string",
                "required": true
            }
        }
    }
}
```

### Choices
You can also predefine a list of choices which the user can select from, similar in functionality to an enum. The only two valid types for these choices are `string` and `number`.

Please note that including choices will *force the user* to choose one of them, and will not allow arbitrary input. Keep this in mind when designing your command tree.

Choices are defined in the command tree with the `choices` property in the option. The type of the option will also be automatically inferred from the choices, so you don't need the `type` property.

```json
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "param": {
                "description": "A regular option with choices",
                "choices": {
                    "Choice A": "choice_a",
                    "Choice B": "choice_b",
                    "Choice C": "random_value"
                }
            }
        }
    }
}
```

Choices are defined as a key-value pair. The key will be a human-readable display name which should be formatted nicely. The value will be the actual value which can be read in your code.

```jsonc
// example of number values
"choices": {
    "Choice A": 25,
    "Choice B": 50,
    "Choice C": 100.2
}
```

### Channel Types
When selecting channels with `type: channel`, by default the user can select any channel they have access to (within a server), which may lead to undesired/unsupported channel types being chosen. Therefore you can optionally specify a limited set of channel types which the user can choose from, and Discord will automatically filter out any other channels.

This greatly improves the user experience, as you can allow Discord to do input validation on channel types, rather than writing code to check it yourself and potentially introducing bugs.

Currently, there are 11 valid channel types defined in the schema: `text`, `dm`, `voice`, `group_dm`, `category`, `announcements`, `store`, `announcement_thread`, `public_thread`, `private_thread` and `stage`.

|Type|Description|
|----|-----------|
|text|A text channel within a server|
|dm|A direct message channel with a user|
|voice|A voice channel within a server|
|group_dm|A direct message channel with multiple users|
|category|A category channel containing many channels|
|announcements|An announcement channel on a server which can be followed|
|store|A channel for game developers to sell their games|
|announcement_thread|A thread channel created from an announcement channel|
|public_thread|A public thread channel created from a text channel|
|private_thread|A private thread channel created from a text channel|
|stage|A stage voice channel with speakers and an audience|

Similar to [choices](#choices), you also do not need to specify the option `type` property, as Slasher will automatically infer that the option is a `channel`.

```json
{
    "lock": {
        "description": "Locks a text channel for 1 minute",
        "options": {
            "channel": {
                "description": "The channel to lock",
                "channel_types": [
                    "text", "public_thread", "private_thread"
                ],
                "required": true
            }
        }
    }
}
```

### Min/Max Values
For `integer` and `number` options exclusively, you can also limit them to a certain range by defining a `min` and `max` value on the option. These options can be used together to limit the numbers to a range, or independently to cap them at certain values. These values are inclusive, meaning the user can input the limit itself as a value (for example, a `min` of 5 will allow any values which are 5 or greater).

```jsonc
{
    "roll": {
        "description": "Rolls a dice",
        "options": {
            "faces": {
                "description": "How many faces the dice has",
                "type": "integer",
                "min": 2,  // value must be >= 2
                "max": 6   // value must be <= 6
            }
        }
    }
}
```

## Subcommands
Commands can also have subcommands as an option, which on Discord's end will esssentially act like an extra command which is nested within the original command.

However, from a code standpoint, it will still run with the original command's name and context, and you must determine which subcommand was run based on the options.

Subcommands are defined like so:
```json
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "sub": {
                "description": "A subcommand within the command",
                "subcommand": true
            }
        }
    }
}
```

This results in the `/command sub` command being added to Discord. As usual, subcommands require a `description` property. In order to mark it as a subcommand, you must either include the `subcommand: true` property, or an `options` property.

Following up on that, subcommands can also include options like normal commands. Pretty much the same rules about normal command options apply [as above](#commands-with-options).

```json
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "sub": {
                "description": "A subcommand within the command with arguments",
                "options": {
                    "param": {
                        "description": "An option in a subcommand",
                        "type": "boolean"
                    }
                }
            }
        }
    }
}
```

## Subcommand Groups
Subcommand groups allow you to bundle multiple related subcommands together. This example from [Discord's documentation](https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups) illustrates how this might be useful:
![Example of subcommand groups](img/subcmdgroup.png)

Subcommand groups are defined as an option of a command:
```jsonc
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "group": {
                "description": "A group of subcommands",
                "subcommands": {
                    // your subcommands go here
                }
            }
        }
    }
}
```

You must provide a `description`, and an object property called `subcommands`. The entries of this object are the same as the [subcommands](#subcommands) section.
```jsonc
{
    "command": {
        "description": "A brief, concise description of the command",
        "options": {
            "group": {
                "description": "A group of subcommands",
                "subcommands": {
                    "alpha": {
                        "description": "The first subcommand",
                        "subcommand": true
                    },
                    "beta": {
                        "description": "The second subcommand",
                        "subcommand": true
                    }
                }
            }
        }
    }
}
```

In Discord, this would create `/command group alpha` and `/command group beta`.

## Permissions
There might be situations where you don't want a particular command to be run by normal server members (e.g. a kick command, a config command, etc). Server admins can manage who can and can't run specific commands (by using `Manage Server > Interactions` on Discord).

However you can set some default permissions on your commands, which is applied if a server owner hasn't chosen their own permissions. This also gives server admins more options, since it means they can give access to the command to users who don't strictly have the permissions you've chosen.

Another advantage over just checking the permissions in your code is that Discord will hide commands from users who don't have permission to use them, which cleans up the command UI significantly, especially if you have lots of admin commands which most users can't use anyway.

Permissions are controlled using the `permissions` option on a command.
```jsonc
{
    "command": {
        "description": "A simple command",
        // controls command permissions
        "permissions": {
            "disabled": false,
            "dm": true,
            "requires": [
                "MANAGE_GUILD", "MANAGE_MESSAGES"
            ]
        }
    }
}
```

The are three total options you can control. None of them are required.
|Option|Type|Default|Description|
|------|----|-------|-----------|
|disabled|boolean|`false`|If set to true, only users with the Administrator permission can use this command and it is disabled for all other users.|
|dm|boolean|`true`|If set to false, the command will not be available to use in direct messages with the bot, it will only be available in servers.|
|requires|string[]|None|Defines a list of permissions which a user must have in order to see and access the command. The user must have all of the listed permissions to access the command. See the list below for a list of valid values.|

### Permission List
Here is a list of valid permission values which can be used in the `requires` array.

|Permission|Description|
|----------|-----------|
|`ADMINISTRATOR`|Administrator, access to all permissions|
|`CREATE_INSTANT_INVITE`|Ability to create server inites|
|`KICK_MEMBERS`|Ability to kick members from a server|
|`BAN_MEMBERS`|Ability to ban members from a server|
|`MANAGE_GUILD`|Ability to edit server config and add bots|
|`MANAGE_CHANNELS`|Ability to add/edit channels|
|`MANAGE_NICKNAMES`|Ability to change user's nicknames|
|`MANAGE_ROLES`|Ability to add/edit roles|
|`MANAGE_WEBHOOKS`|Ability to add/edit webhooks|
|`MANAGE_EMOJIS_AND_STICKERS`|Ability to add/edit emojis and stickers|
|`MANAGE_EVENTS`|Ability to add/edit server events|
|`MANAGE_THREADS`|Ability to edit and archive threads|
|`MANAGE_MESSAGES`|Ability to delete or pin messages|
|`ADD_REACTIONS`|Ability to add reactions to a message|
|`VIEW_AUDIT_LOG`|Ability to view server audit log|
|`PRIORITY_SPEAKER`|Whether the user is a priority speaker in voice channels|
|`STREAM`|Whether the user can stream in voice channels|
|`VIEW_CHANNEL`|Whether the user can view channels|
|`SEND_MESSAGES`|Whether the user can send messages|
|`SEND_TTS_MESSAGES`|Whether the user can send a text-to-speech message|
|`EMBED_LINKS`|Whether the user can embed rich content into messages|
|`ATTACH_FILES`|Whether the user can attach files to messages|
|`READ_MESSAGE_HISTORY`|Whether the user can read the history of channels|
|`MENTION_EVERYONE`|Whether the user can use @everyone in text channels|
|`USE_EXTERNAL_EMOJIS`|Whether the user can use emojis from outside the server (Nitro users only)|
|`USE_EXTERNAL_STICKERS`|Ability to use stickers from outside the server (Nitro users only)|
|`VIEW_GUILD_INSIGHTS`|Whether the user can view the server insights page (alpha feature)|
|`CONNECT`|Whether the user can join voice channels|
|`SPEAK`|Whether the user can speak in voice channels|
|`MUTE_MEMBERS`|Whether the user can mute other users in voice channels|
|`DEAFEN_MEMBERS`|Whether the user can deafen other users in voice channels|
|`MOVE_MEMBERS`|Whether the user can move members between voice channels|
|`USE_VAD`|Whether the user can use voice-activity-detection in a voice channel|
|`CHANGE_NICKNAME`|Whether the user can change their own nickname|
|`USE_APPLICATION_COMMANDS`|Ability to use use slash commands at all|
|`REQUEST_TO_SPEAK`|Ability to request to speak in stage channels|
|`CREATE_PUBLIC_THREADS`|Ability to create public thread channels|
|`CREATE_PRIVATE_THREADS`|Ability to create private thread channels|
|`USE_PUBLIC_THREADS`|More information needed|`USE_PRIVATE_THREADS`|More information needed|
|`SEND_MESSAGES_IN_THREADS`|Ability to send messages in thread channels|
|`START_EMBEDDED_ACTIVITIES`|Ability to start an activity in a channel|
|`MODERATE_MEMBERS`|Ability to timeout other users within the server|

## What's next?
- Learn how to handle [command options](./adding-options.md)