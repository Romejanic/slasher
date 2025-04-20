import { Client, ClientOptions, Events, GatewayIntentBits, Interaction } from "discord.js";
import { makeErrorEmbed } from "./util";
import { SlasherClientOptions } from "./const";
import syncCommandDefinitions from "../sync";

export default class SlasherClient extends Client {

    private readonly slasherOptions: SlasherClientOptions;

    constructor(options?: SlasherClientOptions) {
        super(makeOptions(options));
        this.slasherOptions = options;
        // register interaction handler only if commands are passed
        if(options && options.commands) {
            this.on(Events.InteractionCreate, this.handleInteraction.bind(this));
        }
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
                    console.error("Error while running command", e);
                    const embed = makeErrorEmbed("Error running command", "Sorry, an error occurred while running this command. If the problem persists please contact the bot developer.");
                    if(i.replied || i.deferred) await i.editReply({ embeds: [embed] });
                    else await i.reply({ embeds: [embed] });
                }
            } else {
                const embed = makeErrorEmbed("Command not found", "Sorry, this command does not exist. Please contact the bot developer if you believe this is in error.");
                await i.reply({ embeds: [embed] });
            }
        }
    }

    public async login(token?: string) {
        const result = await super.login(token);
        if(result) {
            this.startCommandSync()
                .catch(err => console.error("Failed to run command sync", err));
        }
        return result;
    }

    private async startCommandSync() {
        const mode = this.slasherOptions.sync?.mode || "auto";
        const destructive = this.slasherOptions.sync?.destructive || true;
        const serverId = this.slasherOptions.sync?.syncServerId;
        syncCommandDefinitions(this, this.slasherOptions.commands, mode, destructive, serverId);
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
