import { APIMessage } from 'discord-api-types';
import { CommandInteraction, Guild, Channel, User, Message, MessageEmbed, InteractionReplyOptions } from 'discord.js';

export type Command = CommandInteraction;

export type CommandContext = {

    /** The name of the command */
    name: string,

    /** The command object itself (for accessing options) */
    command: Command,

    /** Is the current message in a server text channel? */
    isServer: boolean,

    /** Is the current message in the user's direct message channel? */
    isDM: boolean,

    /** The text channel the command was run in */
    channel: Channel,

    /** The user who sent the command */
    user: User,

    /** Server specific values. When isServer is false, this object is null. */
    server?: {
        /** The server object */
        guild: Guild,

        /** Whether this user has the ADMINISTRATOR permission */
        isUserAdmin: boolean
    },

    /**
     * Replies to a command with the given content.
     * @param content The content to reply to the command with
     * @param hidden Whether the content will be visible only to the sender
     * @returns a promise for the sent message
     */
    reply: (content: string | MessageEmbed | InteractionReplyOptions, hidden: boolean) => Promise<Message | APIMessage | void>;

    /**
     * Defers a reply to the command. This causes Discord to display a
     * "bot name is thinking..." prompt.
     * @param hidden Whether the prompt will be visible only to the sender
     * @returns a promise for when the prompt has been created
     */
    defer: (hidden: boolean) => Promise<void>;

    /**
     * Edits the previous reply to the command.
     * @param content The content to edit the reply with
     * @param hidden Whether the content should become visible to the sender only
     * @returns a promise for the sent message
     */
    edit: (content: string | MessageEmbed | InteractionReplyOptions, hidden: boolean) => Promise<Message | APIMessage | void>;

};