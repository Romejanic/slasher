import { Routes, Snowflake } from "discord.js";
import { EffectiveSyncMode } from ".";

export default function syncRoutes(mode: EffectiveSyncMode, clientId: string, serverId?: Snowflake) {
    const server = mode === "server";
    if(server && !serverId) {
        throw new Error("Server sync was requested, but no server ID was provided.");
    }
    return {
        commands: server ? Routes.applicationGuildCommands(clientId, serverId) : Routes.applicationCommands(clientId),
        command: (commandId: Snowflake) => server ? Routes.applicationGuildCommand(clientId, serverId, commandId) : Routes.applicationCommand(clientId, commandId)
    } as const;
}

export type SyncRoutes = ReturnType<typeof syncRoutes>;
