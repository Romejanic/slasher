import { userMention } from "discord.js";
import { type SlasherCommand } from "../../src/commands";

const testCommand: SlasherCommand = {

    name: "test",
    description: "A test of Slasher v2",

    async execute(ctx) {
        await ctx.command.deferReply();
        if(Math.random() > 0.5) throw new Error("Oopsie");
        await ctx.command.editReply({
            content: `Hello world, ${userMention(ctx.command.user.id)}`
        });
    }

};

export default testCommand;
