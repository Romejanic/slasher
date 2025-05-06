import { ChatInputCommandInteraction, LocalizationMap, PermissionsString, SlashCommandBuilder } from "discord.js";
import SlasherCommandOption from "../options";
import CommandBase from "./CommandBase";
import { isSubcommands } from "./SlasherSubcommands";
import { isSubcommandGroups } from "./SlasherSubcommandGroups";

/** Array of permissions which are required to execute a command. */
export type CommandPermissions = PermissionsString[];

export interface CommandContexts {
    /** Allows this command to be used in servers. */
    server: boolean;
    /** Allows this command to be used in DMs with the bot. */
    botDM: boolean;
    /** Allows this command to be used in DMs with other users. */
    otherDM: boolean;
}

export interface InstallScope {
    /** Allows this command to be installed in servers. */
    server: boolean;
    /** Allows this command to be installed for a user. */
    user: boolean;
}

/** Definition for a basic slash command. */
export default interface SlasherCommand extends CommandBase<SlashCommandBuilder> {

    /** A brief description of the command's purpose or function. */
    description: string;

    /** Whether the command can only be used in age-restricted channels. */
    nsfw?: boolean;

    /** Options for this command. The key is used to identify the option name. */
    options?: Record<string, SlasherCommandOption>;

    /** Mapping of localizations for the name and description of the command. */
    localizations?: Partial<{
        name: LocalizationMap;
        description: LocalizationMap;
    }>;

    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: ChatInputCommandInteraction) => Promise<unknown>;

}

export function isSlashCommand(command: object): command is SlasherCommand {
    // these are valid as they are child types
    if(isSubcommands(command) || isSubcommandGroups(command)) return true;
    return "description" in command && "execute" in command && typeof command["execute"] === "function";
}
