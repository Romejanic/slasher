import { LocalizationMap } from "discord.js";
import SlasherCommand from "./SlasherCommand";
import { Subcommand } from "./SlasherSubcommands";

export interface SubcommandGroup {

    /** A brief description of the command's purpose or function. */
    description: string;

    /** Mapping of localizations for the name and description of the command. */
    localizations?: Partial<{
        name: LocalizationMap;
        description: LocalizationMap;
    }>;

    /** The subcommands of this command group. The key is used to identify the subcommand name. */
    subcommands: Record<string, Subcommand>;

}

export default interface SlasherSubcommandGroups extends Omit<SlasherCommand, "options" | "execute"> {
    /** The subcommand groups of this command. The key is used to identify the subcommand group name. */
    groups: Record<string, SubcommandGroup>;
}

/** Validate if the given command definition contains subcommand groups. */
export function isSubcommandGroups(command: object): command is SlasherSubcommandGroups {
    return "groups" in command && typeof command["groups"] === "object";
}
