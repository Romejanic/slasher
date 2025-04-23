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

    const commandsAdd = new Array<RESTPostAPIApplicationCommandsJSONBody>();
    const commandsEdit = new Array<RESTPostAPIApplicationCommandsJSONBody>();
    const commandsSame = new Array<RESTPostAPIApplicationCommandsJSONBody>();

    // determine which commands need to be added or edited
    for(const command of commandList) {
        const existing = existingCommands.find(cmd => cmd.name === command.name);
        if(!existing) commandsAdd.push(command);
        else if(!checkCommandDiff(command, existing)) commandsEdit.push(command);
        else commandsSame.push(command);
    }

    // get list of commands to delete if command name is not found in commands list
    const commandsDelete = existingCommands.filter(cmd => commandList.findIndex(def => cmd.name === def.name) < 0);

    // TODO: change behaviour based on change mode
    switch(changeMode) {
        case "dry-run":
            logger.info("====== SLASHER DRY RUN ======");
            logger.info("Changes have not been applied to Discord. Set \"dryRun\" to false to apply changes.");
            logger.info("Added commands:", commandsAdd.length);
            logger.info("\t", commandsAdd.map(cmd => `/${cmd.name}`).join(", "));
            logger.info("Modified commands:", commandsEdit.length);
            logger.info("\t", commandsEdit.map(cmd => `/${cmd.name}`).join(", "));
            logger.info("Deleted commands:", commandsDelete.length);
            logger.info("\t", commandsDelete.map(cmd => `/${cmd.name}`).join(", "));
            logger.info("Unchanged commands:", commandsSame.length);
            logger.info("\t", commandsSame.map(cmd => `/${cmd.name}`).join(", "));
            break;
        case "non-destructive":
            logger.error("NOT IMPLEMENTED");
            break;
        case "destructive":
        default:
            logger.error("NOT IMPLEMENTED");
            break;
    }
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
