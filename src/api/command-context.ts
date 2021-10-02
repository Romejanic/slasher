import { APIMessage } from 'discord-api-types/v9';
import {
    CommandInteraction, Guild, TextBasedChannels,
    User, Message, MessageEmbed,
    InteractionReplyOptions,
    CommandInteractionOptionResolver,
    GuildMember,
    WebhookEditMessageOptions
} from 'discord.js';
import { SlasherClient } from './wrapped-client';

export declare type Command = CommandInteraction;

export class CommandOptions extends CommandInteractionOptionResolver {
    constructor(parent: CommandInteractionOptionResolver) {
        super(parent.client, Array(...parent.data));
    }

    /**
     * Queries whether an option with the given name is set by the user.
     * @param option the name of the option to check
     * @returns true if the option exists, false otherwise
     */
    has(option: string): boolean {
        return typeof this.get(option) !== "undefined";
    }
};

export interface CommandContext {

    /** The name of the command */
    name: string,

    /** The command object itself */
    command: Command,

    /** The options passed into the command by the user */
    options: CommandOptions,

    /** Is the current message in a server text channel? */
    isServer: boolean,

    /** Is the current message in the user's direct message channel? */
    isDM: boolean,

    /** The text channel the command was run in */
    channel?: TextBasedChannels,

    /** The user who sent the command */
    user: User,

    /** Server specific values. When isServer is false, this object is null. */
    server?: {
        /** The server object */
        guild: Guild,

        /** The guild member object for the sender of the command */
        member: GuildMember,

        /** If the sender is the owner of the server */
        owner: boolean,

        /** Whether this user has the ADMINISTRATOR permission */
        isUserAdmin: boolean,

        /** The name of the server */
        name: string,

        /** The id of this server */
        id: string,
    },

    /** The bot client */
    client: SlasherClient,

    /**
     * Replies to a command with the given content.
     * @param content The content to reply to the command with
     * @param hidden Whether the content will be visible only to the sender
     * @returns a promise for the sent message
     */
    reply: (content: string | MessageEmbed | InteractionReplyOptions, hidden?: boolean) => Promise<Message | APIMessage | void>;

    /**
     * Defers a reply to the command. This causes Discord to display a
     * "bot name is thinking..." prompt.
     * @param hidden Whether the prompt will be visible only to the sender
     * @returns a promise for when the prompt has been created
     */
    defer: (hidden?: boolean) => Promise<void>;

    /**
     * Edits the previous reply to the command.
     * @param content The content to edit the reply with
     * @returns a promise for the sent message
     */
    edit: (content: string | MessageEmbed | WebhookEditMessageOptions) => Promise<Message | APIMessage>;

};