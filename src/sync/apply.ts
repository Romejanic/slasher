import { APIApplicationCommand, REST, RESTPatchAPIApplicationCommandJSONBody } from "discord.js";
import { SyncRoutes } from "./routes";
import SlasherLogger from "../logger";

export type CommandPayload = RESTPatchAPIApplicationCommandJSONBody | APIApplicationCommand;

export async function updateCommands(payloads: CommandPayload[], api: REST, routes: SyncRoutes, logger: SlasherLogger) {
    logger.debug(`Starting update of ${payloads.length} commands`);
    try {
        await api.put(routes.commands, {
            body: payloads
        });
        logger.info("Successfully updated commands");
    } catch(e) {
        logger.error("Failed to update commands", e);
    }
}

export async function deleteCommands(commands: APIApplicationCommand[], api: REST, routes: SyncRoutes, logger: SlasherLogger) {
    if(commands.length === 0) return;
    logger.debug(`Starting deletion of ${commands.length} commands`);
    for(const command of commands) {
        try {
            await api.delete(routes.command(command.id));
            logger.info("Deleted command", command.name);
        } catch(e) {
            logger.error("Failed to delete command", command.name, e);
        }
    }
}
