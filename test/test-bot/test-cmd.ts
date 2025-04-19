import { userMention } from "discord.js";
import { type SlasherCommand } from "../../src/commands";

const testCommand: SlasherCommand = {

    name: "test",
    description: "A test of Slasher v2",

    async execute(cmd) {
        await cmd.reply({
            content: `Hello world, ${userMention(cmd.user.id)}`
        });
    }

};

export default testCommand;
