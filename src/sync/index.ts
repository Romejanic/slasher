import { GuildResolvable, Routes } from "discord.js";
import SlasherClient from "../client";
import { CommandSyncMode } from "../client/const";
import { SlasherCommand } from "../commands";

type EffectiveSyncMode = "global" | "server" | "none";

export default async function syncCommandDefinitions(client: SlasherClient, commands: SlasherCommand[], modeParam: CommandSyncMode, destructive: boolean, serverId?: GuildResolvable) {
    const { logger, rest } = client;

    // print debug info
    logger.debug("REST Version:", rest.options.version);

    // get the effective mode
    // if it's none, there's nothing to do
    const mode = getEffectiveMode(modeParam, serverId);
    if(mode === "none") return;

    // get current command list
    // const commandList = await rest.get(Routes.applicationCommands(client.application.id));
    // console.log(commandList);
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
