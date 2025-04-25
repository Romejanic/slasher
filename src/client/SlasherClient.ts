import { Client, ClientOptions, Events, GatewayIntentBits } from "discord.js";
import { SlasherClientOptions } from "./const";
import syncCommandDefinitions, { EffectiveChangeMode } from "../sync";
import SlasherLogger from "../logger";
import dispatchInteraction from "./dispatch";

export default class SlasherClient extends Client {

    private readonly slasherOptions: SlasherClientOptions;
    private readonly slasherLogger: SlasherLogger;

    constructor(options?: SlasherClientOptions) {
        super(makeOptions(options));
        this.slasherOptions = options;
        this.slasherLogger = new SlasherLogger(options?.logger?.level || "warn", options?.logger?.prefix);
        // register interaction handler only if commands are passed
        if(options && options.commands) {
            this.on(Events.InteractionCreate, async i => await dispatchInteraction(this, options.commands, i));
        }
        // register ready handler
        this.once(Events.ClientReady, () => {
            this.slasherLogger.debug(`Slasher client ready (user: ${this.user.tag})`);
        });
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
