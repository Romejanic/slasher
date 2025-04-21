import { SlashCommandBuilder } from "discord.js";
import { SlasherCommand } from ".";

export default function buildApiCommand(command: SlasherCommand) {
    const builder = new SlashCommandBuilder();
    // basic details
    builder.setName(command.name)
        .setDescription(command.description);
    // finished
    return builder;
}
