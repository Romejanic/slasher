import { CommandInteraction, Guild, TextChannel, User } from 'discord.js';

export type Command = CommandInteraction;

export type CommandContext = {

    // command information
    name: string,
    command: Command,

    // is the current message in a server text channel?
    isServer: boolean,

    // is the current message in a user's dm channel?
    isDM: boolean,

    // general values
    channel: TextChannel,
    user: User,

    // server specific values
    server?: {
        // the server object
        guild: Guild,

        // whether this user has the ADMINISTRATOR permission
        isUserAdmin: boolean
    }

};