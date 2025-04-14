import { Events } from "discord.js";
import SlasherClient from "../../src/client";
import testCommand from "./test-cmd";

const client = new SlasherClient({
    commands: [
        testCommand
    ]
});

client.on(Events.ClientReady, () => {
    console.log("Logged in as", client.user?.tag);
});

const token = Bun.env.BOT_TOKEN;
client.login(token);
