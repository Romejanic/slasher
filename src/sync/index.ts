import { APIApplicationCommand, GuildResolvable, RESTGetAPIApplicationCommandsResult, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder, Snowflake } from "discord.js";
import SlasherClient from "../client";
import { CommandSyncMode } from "../client/const";
import { SlasherCommand } from "../commands";
import syncRoutes from "./routes";
import buildApiCommand from "../commands/api";
import checkCommandDiff from "../commands/diff";

export type EffectiveSyncMode = "global" | "server" | "none";
export type EffectiveChangeMode = "destructive" | "non-destructive" | "dry-run";

export default async function syncCommandDefinitions(client: SlasherClient, commands: SlasherCommand[], modeParam: CommandSyncMode, changeMode: EffectiveChangeMode, serverId?: Snowflake) {
    const { logger, rest } = client;
    const mode = getEffectiveMode(modeParam, serverId);

    // print debug info
    logger.debug("REST Version:", rest.options.version);
    logger.debug("Effective sync mode:", mode);
    logger.debug("Effective change mode:", changeMode);

    // check the effective mode
    // if it's none, there's nothing to do
    if(mode === "none") return;

    // get the routes for the sync mode that was requested and the current command list
    const routes = syncRoutes(mode, client.application.id, serverId);
    const existingCommands = await rest.get(routes.commands) as RESTGetAPIApplicationCommandsResult;

    // convert each command definition to a command builder
    const commandList = new Array<RESTPostAPIApplicationCommandsJSONBody>();
    for(const command of commands) {
        commandList.push(buildApiCommand(command).toJSON());
    }

    const modifiedCommands = new Array<RESTPostAPIApplicationCommandsJSONBody>();
    const removedCommands = new Array<APIApplicationCommand>();
    logger.debug("eq:", checkCommandDiff(commandList[0], existingCommands[0]));


    // update commands with discord
    try {
        await rest.put(routes.commands, {
            body: commandList
        });
        logger.info("Successfully updated commands");
    } catch(e) {
        logger.error("Failed to update app commands", e);
    }

    // TODO: change behaviour based on change mode
    // switch(changeMode) {
    //     case "dry-run":

    //         break;
    //     case "non-destructive":
    //         break;
    //     case "destructive":
    //     default:
    //         break;
    // }
}

function getEffectiveMode(mode: CommandSyncMode, serverId?: GuildResolvable): EffectiveSyncMode {
    switch(mode) {
        case "force-global": return "global";
        case "force-server": return "server";
        case "disabled": return "none";
        case "auto":
        default:
            if(serverId) return "server";
            else return "global";
    }
}
