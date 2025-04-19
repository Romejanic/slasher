import { Client, ClientOptions, Events, GatewayIntentBits, Interaction } from "discord.js";
import { makeErrorEmbed } from "./util";
import { SlasherClientOptions } from "./const";

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
