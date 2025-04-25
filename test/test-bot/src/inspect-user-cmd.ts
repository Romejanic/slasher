import { EmbedBuilder, GuildMember, MessageFlags } from "discord.js";
import type SlasherContextCommand from "../../../src/commands/types/SlasherContextMenuCommand";

const inspectUserCommand: SlasherContextCommand = {
    name: "Inspect user",
    target: "user",

    contexts: {
        server: true
    },

    async execute(ctx) {
        const member = ctx.targetMember! as GuildMember;
        const embed = new EmbedBuilder()
            .setTitle(member.user.displayName)
            .setFields([
                { name: "Highest Role", value: member.roles.highest.name },
                { name: "Join Date", value: member.joinedAt?.toString() || "n/a" }
            ]);
        await ctx.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    },

};

export default inspectUserCommand;
