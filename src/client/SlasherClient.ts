import { Client, ClientOptions, Events, GatewayIntentBits, Interaction } from "discord.js";
import { makeErrorEmbed } from "./util";
import { SlasherClientOptions } from "./const";
import syncCommandDefinitions, { EffectiveChangeMode } from "../sync";
import SlasherLogger from "../logger";

export default class SlasherClient extends Client {

    private readonly slasherOptions: SlasherClientOptions;
    private readonly slasherLogger: SlasherLogger;

    constructor(options?: SlasherClientOptions) {
        super(makeOptions(options));
        this.slasherOptions = options;
        this.slasherLogger = new SlasherLogger(options?.logger?.level || "warn", options?.logger?.prefix);
        // register interaction handler only if commands are passed
        if(options && options.commands) {
            this.on(Events.InteractionCreate, this.handleInteraction.bind(this));
        }
        // register ready handler
        this.once(Events.ClientReady, () => {
            this.slasherLogger.debug(`Slasher client ready (user: ${this.user.tag})`);
        });
    }

    private async handleInteraction(i: Interaction) {
        // TODO add support for other command types
        if(!i.isChatInputCommand()) return;
        // find matching command
        if(this.slasherOptions.commands) {
            const cmd = this.slasherOptions.commands.find(v => v.name === i.commandName);
            if(cmd) {
                try {
                    await cmd.execute(i);
                } catch(e) {
                    this.logger.error("Error while running command", e);
                    const embed = makeErrorEmbed("Error running command", "Sorry, an error occurred while running this command. If the problem persists please contact the bot developer.");
                    if(i.replied || i.deferred) await i.editReply({ embeds: [embed] });
                    else await i.reply({ embeds: [embed] });
                }
            } else {
                this.logger.warn(`Unknown command /${i.commandName}, commands may be out of date`);
                const embed = makeErrorEmbed("Command not found", "Sorry, this command does not exist. Please contact the bot developer if you believe this is in error.");
                await i.reply({ embeds: [embed] });
            }
        }
    }

    public async login(token?: string) {
        const result = await super.login(token);
        if(result) {
            this.startCommandSync()
                .catch(err => this.logger.error("Failed to run command sync", err));
        }
        return result;
    }

    private async startCommandSync() {
        const mode = this.slasherOptions.sync?.mode || "auto";
        const destructive = this.slasherOptions.sync?.destructive ?? true;
        const dryRun = this.slasherOptions.sync?.dryRun ?? false;
        const serverId = this.slasherOptions.sync?.syncServerId;
        const changeMode: EffectiveChangeMode = dryRun ? "dry-run" : destructive ? "destructive" : "non-destructive";
        await syncCommandDefinitions(this, this.slasherOptions.commands, mode, changeMode, serverId);
    }

    public get logger() {
        return this.slasherLogger;
    }

}

function makeOptions(options?: SlasherClientOptions): ClientOptions {
    if(!options) {
        return {
            intents: [GatewayIntentBits.Guilds]
        };
    }
    // TODO: implement handling of custom intents
    return {
        ...options,
        intents: [GatewayIntentBits.Guilds]
    };
}
