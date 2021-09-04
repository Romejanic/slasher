export type CommandTree = {
    [name: string]: Command
};

export type Command = {
    description: string,
    options?: {
        [name: string]: Option | Subcommand | SubcommandGroup
    }
};

export type Option = {
    description: string,
    required?: boolean,
    type?: "string" | "integer" | "boolean" | "user" | "channel" | "role" | "mentionable",
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