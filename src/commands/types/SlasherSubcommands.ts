import { ChatInputCommandInteraction, LocalizationMap } from "discord.js";
import SlasherCommand from "./SlasherCommand";
import SlasherCommandOption from "../options";

export interface Subcommand {

    /** A brief description of the command's purpose or function. */
    description: string;

    /** Mapping of localizations for the name and description of the command. */
    localizations?: Partial<{
        name: LocalizationMap;
        description: LocalizationMap;
    }>;

    /** Options for this command. The key is used to identify the option name. */
    options?: Record<string, SlasherCommandOption>;

    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: ChatInputCommandInteraction) => unknown;

}

/** Definition for a slash command using subcommands. */
export default interface SlasherSubcommands extends Omit<SlasherCommand, "options" | "execute"> {
    /** The subcommands for this command. The key is used to identify the subcommand name. */
    subcommands: Record<string, Subcommand>;
}

/** Validate if the given command definition contains subcommands. */
export function isSubcommands(command: object): command is SlasherSubcommands {
    return "subcommands" in command && typeof command["subcommands"] === "object";
}
