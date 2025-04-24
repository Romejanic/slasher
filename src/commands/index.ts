import { CommandInteraction, LocalizationMap, PermissionsString } from "discord.js";
import SlasherCommandOption from "./options";

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

export interface SlasherCommand {

    /** The name of the command as executed in Discord. */
    name: string;

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

    /** The default permissions applied to your command. This can be overridden by server owners. */
    defaultPermissions?: CommandPermissions;

    /** The contexts in which the command can be used. */
    contexts?: Partial<CommandContexts>;

    /** Where this command can be installed (guild or user). */
    installScope?: Partial<InstallScope>;

    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: CommandInteraction) => unknown;

}
