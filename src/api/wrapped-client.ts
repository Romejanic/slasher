import {
    Client, ClientOptions, Intents,
    IntentsString, MessageEmbed,
    InteractionReplyOptions, ClientEvents,
    Awaitable,
    BitFieldResolvable,
    WebhookEditMessageOptions,
    GuildChannel,
    Message
} from 'discord.js';
import * as fs from 'fs';
import { Command, CommandContext, CommandOptions } from './command-context';

export declare type SlasherClientOptions = Omit<ClientOptions, 'intents'> & {
    /** The bot's login token, from the 'Bot' section of the application */
    token?: string,
    /** Whether to read the token from the auth.json file */
    useAuth?: boolean,
    /** The intents for this client, in most cases this can be left undefined */
    intents?: BitFieldResolvable<IntentsString, number>
};

export class SlasherClient extends Client {

    private botToken: string;

    constructor(options: SlasherClientOptions) {
        super(filterOptions(options));
        this.botToken = getBotToken(options);
        this.addCommandHandler();
    }

    private addCommandHandler() {
        this.on("interactionCreate", async (interaction) => {
            // ignore the interaction if it's not a command
            if(!interaction.isCommand()) return;

            // create command context object
            let cmd = interaction as Command;
            let ctx: CommandContext = {
                name: cmd.commandName,
                command: cmd,
                options: interaction.options,
                isServer: cmd.inGuild(),
                isDM: (await cmd.user.createDM()).id === interaction.channelId,
                channel: cmd.channel,
                user: cmd.user,
                client: this,
                server: cmd.inGuild() ? {
                    guild: cmd.guild,
                    name: cmd.guild.name,
                    id: cmd.guild.id,
                    member: cmd.guild.members.resolve(cmd.user.id),
                    owner: cmd.user.id === cmd.guild.ownerId,
                    isUserAdmin: cmd.guild.members.resolve(cmd.user.id).permissions.has("ADMINISTRATOR"),
                    channelPermissions: (cmd.channel as GuildChannel).permissionsFor(cmd.user)
                } : undefined,
                reply: async (content, hidden = false) => {
                    let contentString  = typeof content === "string" ? content as string : undefined;
                    let contentEmbed   = typeof content === "object" && typeof (content as MessageEmbed).title !== "undefined" ? content as MessageEmbed : undefined;
                    let contentOptions = typeof content === "object" && contentEmbed == undefined ? content as InteractionReplyOptions : undefined;
                    if(contentOptions) {
                        contentOptions.ephemeral = hidden;
                        return await cmd.reply(contentOptions);
                    } else {
                        return await cmd.reply({
                            content: contentString,
                            embeds: contentEmbed ? [contentEmbed] : undefined,
                            ephemeral: hidden
                        });
                    }
                },
                defer: async (hidden = false): Promise<void> => {
                    return await cmd.deferReply({
                        ephemeral: hidden 
                    });
                },
                edit: async (content) => {
                    let contentString  = typeof content === "string" ? content as string : undefined;
                    let contentEmbed   = typeof content === "object" && typeof (content as MessageEmbed).title !== "undefined" ? content as MessageEmbed : undefined;
                    let contentOptions = typeof content === "object" && contentEmbed == undefined ? content as WebhookEditMessageOptions : undefined;
                    if(contentOptions) {
                        return await cmd.editReply(contentOptions).then(m => m as Message);
                    } else {
                        return await cmd.editReply({
                            content: contentString,
                            embeds: contentEmbed ? [contentEmbed] : undefined
                        }).then(m => m as Message);
                    }
                },
                followUp: async (content, hidden = false) => {
                    let contentString  = typeof content === "string" ? content as string : undefined;
                    let contentEmbed   = typeof content === "object" && typeof (content as MessageEmbed).title !== "undefined" ? content as MessageEmbed : undefined;
                    let contentOptions = typeof content === "object" && contentEmbed == undefined ? content as InteractionReplyOptions : undefined;
                    if(contentOptions) {
                        contentOptions.ephemeral = hidden;
                        return await cmd.followUp(contentOptions).then(m => m as Message);
                    } else {
                        return await cmd.followUp({
                            content: contentString,
                            embeds: contentEmbed ? [contentEmbed] : undefined,
                            ephemeral: hidden
                        }).then(m => m as Message);
                    }
                },
                modalResponse: async (modal, timeout = 10 * 60 * 1000, options) => {
                    if(!options) {
                        options = { time: timeout };
                    }
                    options.filter = options.filter ? options.filter : i => i.customId === modal.customId;
                    options.time = options.time ? options.time : timeout;
                    await cmd.showModal(modal);
                    return await cmd.awaitModalSubmit(options);
                }
            };

            // emit the command event with the context
            this.emit("command", ctx);
        });
    }

    login(token?: string) {
        if(!token) return super.login(this.botToken);
        else {
            console.warn("Detected token being passed to login function! You should add it to the client options instead.");
            return super.login(token);
        }
    }

}

export declare interface SlasherClient {
    on(event: "command", listener: (context: CommandContext) => void): this;
    once(event: "command", listener: (context: CommandContext) => void): this;
    off(event: "command", listener: (context: CommandContext) => void): this;
    removeAllListeners(event: "command"): this;

    // required for existing discord.js events to carry over
    on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    on<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaitable<void>,
    ): this;

    once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    once<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaitable<void>,
    ): this;

    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean;

    off<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
    off<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaitable<void>,
    ): this;

    removeAllListeners<K extends keyof ClientEvents>(event?: K): this;
    removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ClientEvents>): this;
}

// gets the token from either the options or the auth.json file
function getBotToken(options: SlasherClientOptions): string {
    if(options.token) return options.token;
    if(options.useAuth && fs.existsSync("auth.json")) {
        let data = fs.readFileSync("auth.json");
        let json = JSON.parse(data.toString());
        return json.token;
    } else {
        console.warn("Could not find bot token in client options or auth.json!");
        console.warn("You must either provide a token or set useAuth to true!");
    }
    return null;
}

// ensures the client options contains the GUILDS intent
function filterOptions(options: SlasherClientOptions) {
    let finalOptions = options as ClientOptions;
    if(!options.intents) {
        finalOptions.intents = [ Intents.FLAGS.GUILDS ];
    } else if (Array.isArray(options.intents)) {
        finalOptions.intents = [ ...options.intents, Intents.FLAGS.GUILDS ];
    } else if(typeof options.intents === "number") {
        finalOptions.intents = options.intents & Intents.FLAGS.GUILDS;
    } else if(typeof options.intents === "string") {
        // this probably shouldn't be used, but maybe the user
        // needs a specific intent other than GUILDS? just leave
        // it be
        finalOptions.intents = options.intents as IntentsString;
    }
    delete options.token;
    return finalOptions;
}