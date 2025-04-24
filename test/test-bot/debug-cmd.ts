import type { SlasherCommand } from "../../src/commands";

const debugCommand: SlasherCommand = {
    name: "debug",
    description: "A command strictly for debugging, NOTHING ELSE",

    async execute(ctx) {
        await ctx.reply("Bugs! Bugs everywhere!")
    }
};

export default debugCommand;
