import { LocalizationMap, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import CommandBase from "./CommandBase";

export type ContextMenuTarget = "user" | "message";

interface ContextCommandBase extends CommandBase {

    /** Mapping of localizations for the name of the command. */
    nameLocalizations?: LocalizationMap;

    /** What kind of item this command targets. */
    target: ContextMenuTarget;

}

export interface SlasherUserContextCommand extends ContextCommandBase {
    target: "user";
    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: UserContextMenuCommandInteraction) => Promise<unknown>;
}

export interface SlasherMessageContextCommand extends ContextCommandBase {
    target: "message";
    /**
     * The function which is called when this command is invoked which handles its execution.
     * @param ctx The command context containing information about the command.
     */
    execute: (ctx: MessageContextMenuCommandInteraction) => Promise<unknown>;
}

// union type for all context command types
type SlasherContextCommand = SlasherUserContextCommand | SlasherMessageContextCommand;
export default SlasherContextCommand;

/** Checks if the given command is a context menu command. */
export function isContextMenuCommand(command: object): command is SlasherContextCommand {
    return "target" in command && (command["target"] === "user" || command["target"] === "message");
}
