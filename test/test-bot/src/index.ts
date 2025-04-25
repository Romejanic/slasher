import { Events } from "discord.js";
import SlasherClient from "../../../src/client";
import testCommand from "./test-cmd";
import guessCommand from "./guess-cmd";
import subcommandTest from "./sub-cmd";
import subcommandGroupTest from "./group-cmd";

const client = new SlasherClient({
    commands: [
        testCommand,
        guessCommand,
        subcommandTest,
        subcommandGroupTest
    ],
    sync: {
        syncServerId: "883650514431148053"
    },
    logger: {
        level: "debug"
    }
});

client.on(Events.ClientReady, () => {
    console.log("Logged in as", client.user?.tag);
});

const token = Bun.env.BOT_TOKEN;
client.login(token);
