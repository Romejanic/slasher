import { Client, ClientOptions, Intents, IntentsString } from 'discord.js';
import * as fs from 'fs';

export type SlasherClientOptions = ClientOptions & { token: string, useAuth: boolean };

export class SlasherClient extends Client {

    private botToken: string;

    constructor(options: SlasherClientOptions) {
        super(filterOptions(options));
        this.botToken = getBotToken(options);
        this.addCommandHandler();
    }

    private addCommandHandler() {
        this.on("interactionCreate", (interaction) => {
            
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

// gets the token from either the options or the auth.json file
function getBotToken(options: SlasherClientOptions): string {
    if(options.token) return options.token;
    if(options.useAuth && fs.existsSync("auth.json")) {
        let data = fs.readFileSync("auth.json");
        let json = JSON.parse(data.toString());
        return json.token;
    }
    return null;
}

// ensures the client options contains the GUILDS intent
function filterOptions(options: SlasherClientOptions) {
    if(!options.intents) {
        options.intents = [ Intents.FLAGS.GUILDS ];
    } else if(typeof options.intents === "number") {
        options.intents = options.intents & Intents.FLAGS.GUILDS;
    } else if(typeof options.intents === "string") {
        // this probably shouldn't be used, but maybe the user
        // needs a specific intent other than GUILDS? just leave
        // it be
        options.intents = options.intents as IntentsString;
    }
    delete options.token;
    return options;
}