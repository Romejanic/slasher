import type { SlasherCommand } from "../../../src/commands";

const guessCommand: SlasherCommand = {
    name: "guess",
    description: "Try and guess what number I'm thinking",

    options: {
        "guess": {
            type: "integer",
            description: "Enter your guess",
            required: true,
            min: 1,
            max: 10
        },
        "always-win": {
            type: "boolean",
            description: "Cheat mode enabled"
        }
    },

    async execute(ctx) {
        const num = Math.floor(Math.random() * 10) + 1;
        const guess = ctx.options.get("guess")?.value as number;
        const alwaysWin = ctx.options.get("always-win")?.value as boolean;
        if(num === guess || alwaysWin) {
            await ctx.reply("You guessed correct! My number was " + num + (alwaysWin ? " (cheater)" : ""));
        } else {
            await ctx.reply("Aww sorry! My number was " + num);
        }
    }
};

export default guessCommand;
