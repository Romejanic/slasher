import { EmbedBuilder } from "discord.js";

export function makeErrorEmbed(title: string, description: string) {
    return new EmbedBuilder()
        .setTitle(title)
        .setColor("Red")
        .setDescription(description);
}
