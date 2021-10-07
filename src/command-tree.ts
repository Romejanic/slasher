export type CommandTree = {
    [name: string]: Command
};

export type OptionList = {
    [name: string]: Option | Subcommand | SubcommandGroup
}

export type Command = {
    description: string,
    options?: OptionList
};

type ChannelType = "text" | "dm" | "voice" | "group_dm" | "category" | "announcements" | "store" | "announcement_thread" | "public_thread" | "private_thread" | "stage";

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