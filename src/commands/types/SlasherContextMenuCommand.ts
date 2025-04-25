import { ContextMenuCommandInteraction, LocalizationMap } from "discord.js";
import CommandBase from "./CommandBase";

export type ContextMenuTarget = "user" | "message";

export interface SlasherContextMenuCommand extends CommandBase {

    /** Mapping of localizations for the name of the command. */
    nameLocalizations?: LocalizationMap;

    /** What kind of item this command targets. */
    target: ContextMenuTarget;

    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: ContextMenuCommandInteraction) => Promise<unknown>;

}
