import { SlashCommandBuilder } from "discord.js";
import { SlasherCommand } from ".";
import { getIntegrationTypes, getInteractionContexts } from "./util";

export default function buildApiCommand(command: SlasherCommand) {
    const builder = new SlashCommandBuilder();
    // basic details
    builder.setName(command.name)
        .setDescription(command.description)
        .setDefaultMemberPermissions(command.defaultPermissions ?? null)
        .setNSFW(command.nsfw ?? false);
    // other optional fields
    if(command.contexts) builder.setContexts(getInteractionContexts(command.contexts));
    if(command.installScope) builder.setIntegrationTypes(getIntegrationTypes(command.installScope));
    // finished
    return builder;
}
