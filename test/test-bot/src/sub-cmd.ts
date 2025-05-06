import { EmbedBuilder } from "discord.js";
import type SlasherSubcommands from "../../../src/commands/types/SlasherSubcommands";

const subcommandTest: SlasherSubcommands = {

    name: "subcmd",
    description: "Test for subcommands",

    subcommands: {
        first: {
            description: "The first subcommand",
            async execute(ctx) {
                await ctx.reply("This is the FIRST one");
            },
        },
        second: {
            description: "The second subcommand",
            async execute(ctx) {
                await ctx.reply({
                    embeds: [new EmbedBuilder({
                        title: "SECOND",
                        description: "fancy!"
                    })]
                });
            },
        }
    },

    builderHook(builder) {
        builder.setDescription("desc override");
    },

};

export default subcommandTest;
