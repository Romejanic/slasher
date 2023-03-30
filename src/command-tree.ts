import { PermissionsBitField, PermissionsString } from "discord.js";

export type CommandTree = {
    [name: string]: Command
};

export type OptionList = {
    [name: string]: Option | Subcommand | SubcommandGroup
};

export type PermissionList = {
    dm?: boolean,
    disabled?: boolean,
    requires?: PermissionsString[],
    permission_value: PermissionsBitField
};

export type Command = {
    description: string,
    options?: OptionList,
    permissions?: PermissionList;
};

type ChannelType =
    "text" | "dm" | "voice" | "group_dm" | "category" | "announcements" | "store" | "announcement_thread" | "public_thread" |
    "private_thread" | "stage";

export type Option = {
    description: string,
    required?: boolean,
    type?: "string" | "integer" | "number" | "boolean" | "user" | "channel" | "role" | "mentionable",
    channel_types?: ChannelType[],
    choices?: {
        [name: string]: string | number
    },
    min?: number,
    max?: number
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