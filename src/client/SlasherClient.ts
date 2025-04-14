import { BitFieldResolvable, Client, ClientOptions, EmbedBuilder, Events, GatewayIntentBits, GatewayIntentsString, Interaction } from "discord.js";
import { SlasherCommand } from "../commands";

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
                await cmd.execute({
                    command: i
                });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle("Command not found")
                    .setColor("Red")
                    .setDescription("Sorry, this command does not exist. Please contact the bot developer if you believe this is in error.");
                await i.reply({ embeds: [embed] });
            }
        }
    }

}

export type SlasherClientOptions = Omit<ClientOptions, "intents"> & {
    /** List of gateway intents */
    intents?: BitFieldResolvable<GatewayIntentsString, number>;
    /** List of commands to process */
    commands?: SlasherCommand[];
};

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
