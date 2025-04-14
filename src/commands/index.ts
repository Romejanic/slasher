import { CommandInteraction } from "discord.js";
import CommandContext from "./context";

export interface SlasherCommand {

    /** The name of the command as executed in Discord. */
    name: string;

    /** A brief description of the command's purpose or function. */
    description: string;

    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: CommandContext) => unknown;

}
