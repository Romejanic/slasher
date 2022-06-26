import { Permissions } from "discord.js";

export type CommandTree = {
    [name: string]: Command
};

export type OptionList = {
    [name: string]: Option | Subcommand | SubcommandGroup
};

export type PermissionList = {
    dm?: boolean,
    disabled?: boolean,
    requires?: Permission[],
    permission_value: Permissions
};

export type Command = {
    description: string,
    options?: OptionList,
    permissions?: PermissionList;
};

type ChannelType =
    "text" | "dm" | "voice" | "group_dm" | "category" | "announcements" | "store" | "announcement_thread" | "public_thread" |
    "private_thread" | "stage";
type Permission =
    "CREATE_INSTANT_INVITE" | "KICK_MEMBERS" | "BAN_MEMBERS" | "ADMINISTRATOR" | "MANAGE_CHANNELS" | "MANAGE_GUILD" | "ADD_REACTIONS" |
    "VIEW_AUDIT_LOG" | "PRIORITY_SPEAKER" | "STREAM" | "VIEW_CHANNEL" | "SEND_MESSAGES" | "SEND_TTS_MESSAGES" | "MANAGE_MESSAGES" |
    "EMBED_LINKS" | "ATTACH_FILES" | "READ_MESSAGE_HISTORY" | "MENTION_EVERYONE" | "USE_EXTERNAL_EMOJIS" | "VIEW_GUILD_INSIGHTS" |
    "CONNECT" | "SPEAK" | "MUTE_MEMBERS" | "DEAFEN_MEMBERS" | "MOVE_MEMBERS" | "USE_VAD" | "CHANGE_NICKNAME" | "MANAGE_NICKNAMES" |
    "MANAGE_ROLES" | "MANAGE_WEBHOOKS" | "MANAGE_EMOJIS_AND_STICKERS" | "USE_APPLICATION_COMMANDS" | "REQUEST_TO_SPEAK" | "MANAGE_EVENTS" |
    "MANAGE_THREADS" | "USE_PUBLIC_THREADS" | "CREATE_PUBLIC_THREADS" | "USE_PRIVATE_THREADS" | "CREATE_PRIVATE_THREADS" |
    "USE_EXTERNAL_STICKERS" | "SEND_MESSAGES_IN_THREADS" | "START_EMBEDDED_ACTIVITIES" | "MODERATE_MEMBERS";

export type Option = {
    description: string,
    required?: boolean,
    type?: "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable",
    channel_types?: ChannelType[],
    choices?: {
        [name: string]: string | number
    }
};

export type Subcommand = {
    description: string,
    subcommand?: boolean,
    options?: {
        [name: string]: Option
    }
};

export type SubcommandGroup = {
    description: string,
    subcommands: {
        [name: string]: Subcommand
    }
};