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