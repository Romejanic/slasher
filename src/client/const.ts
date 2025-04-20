import { ClientOptions, GuildResolvable } from "discord.js";
import { SlasherCommand } from "../commands";
import { LogLevel } from "../logger";

/** Type for controlling sync mode of client */
export type CommandSyncMode = "auto" | "force-global" | "force-server" | "disabled";

/** Additional options for SlasherClient */
export type SlasherClientOptions = Omit<ClientOptions, "intents"> & {
    /** List of gateway intents */
    intents?: ClientOptions["intents"];
    /** List of commands to process */
    commands?: SlasherCommand[];
    /** Configuration for command sync functionality */
    sync?: {
        /** The scope of command sync. Default: `auto` */
        mode?: CommandSyncMode;
        /** Determines whether the command sync should delete undefined/removed commands. Default: `true` */
        destructive?: boolean;
        /** The ID of the server to sync commands to for development purposes. If mode is "auto", this option will force a server sync. */
        syncServerId?: GuildResolvable;
    };
    /** Configuration for Slasher logger */
    logger?: {
        /** Minimum logger level, logs below this level will not be printed. Default: `warn` */
        level?: LogLevel;
        /** Log message prefix. Default: `[%ts][%level]` */
        prefix?: string;
    };
};
