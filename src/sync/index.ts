import { GuildResolvable, RESTGetAPIApplicationCommandsResult, RESTPostAPIApplicationCommandsJSONBody, Snowflake } from "discord.js";
import SlasherClient from "../client";
import { CommandSyncMode } from "../client/const";
import { SlasherCommand } from "../commands";
import syncRoutes from "./routes";
import buildApiCommand from "../commands/api";
import checkCommandDiff from "../commands/diff";
import { deleteCommands, updateCommands } from "./apply";

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

    // determine if action is required based on if any changes are required
    const actionRequired = commandsAdd.length > 0 || commandsEdit.length > 0 || commandsDelete.length > 0;

    // act depending on the change mode
    if(changeMode === "dry-run") {
        logger.info("====== SLASHER DRY RUN ======");
        if(actionRequired) {
            logger.info("Changes have not been applied to Discord. Set \"dryRun\" to false to apply changes.");
            logger.info("Added commands:", commandsAdd.length);
            logger.info("\t", commandsAdd.map(cmd => `/${cmd.name}`).join(", "));
            logger.info("Modified commands:", commandsEdit.length);
            logger.info("\t", commandsEdit.map(cmd => `/${cmd.name}`).join(", "));
            logger.info("Deleted commands:", commandsDelete.length);
            logger.info("\t", commandsDelete.map(cmd => `/${cmd.name}`).join(", "));
        } else {
            logger.info("No actions are required, there were no modifications made");
        }
        logger.info("Unchanged commands:", commandsSame.length);
        logger.info("\t", commandsSame.map(cmd => `/${cmd.name}`).join(", "));
    } else if(actionRequired) {
        // action is required so we will update the commands
        let payloads = [ ...commandsAdd, ...commandsEdit, ...commandsSame ];

        // print debug messages
        logger.debug("add:", commandsAdd.length, "modify:", commandsEdit.length, "unchanged:", commandsSame.length, "delete:", commandsDelete.length);
        if(mode === "global") logger.debug("Global updates may take up to an hour to reflect");

        // determine if sync is a delete-only operation
        const deleteOnly = commandsAdd.length === 0 && commandsEdit.length === 0 && commandsDelete.length > 0;
        
        // either delete or preserve removed commands depending on mode
        if(changeMode === "destructive") {
            await deleteCommands(commandsDelete, rest, routes, logger);
        } else {
            logger.debug(`Non-destructive mode, deleted commands will be preserved`);
            payloads = [ ...payloads, ...commandsDelete ];
            // if all other commands are unchanged there's nothing to do
            if(deleteOnly) {
                logger.debug("Skipping sync as there are no other modifications required");
                return;
            }
        }

        // apply changes to all other commands
        if(!deleteOnly) {
            await updateCommands(payloads, rest, routes, logger);
        }
    } else {
        logger.debug("Sync not required, there were no modifications made");
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
