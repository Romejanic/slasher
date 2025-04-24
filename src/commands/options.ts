import { ApplicationCommandOptionAllowedChannelTypes, LocalizationMap } from "discord.js";

// TODO:
// subcommand
// subcommand group

type OptionType = "attachment" | "boolean" | "channel" | "integer" | "mentionable" | "number" | "role" | "string" | "user";

type BaseOption = {
    /** The type of this option, used to identify the properties. */
    readonly type: OptionType;
    /** A brief description of the option's purpose or function. */
    description: string;
    /** Whether this option is required for the command to be executed. */
    required?: boolean;
    /** Mapping of localizations for the name and description of the command. */
    localizations?: Partial<{
        name: LocalizationMap;
        description: LocalizationMap;
    }>;
};

export interface AttachmentOption extends BaseOption {
    readonly type: "attachment";
}

export interface BooleanOption extends BaseOption {
    readonly type: "boolean";
}

export interface ChannelOption extends BaseOption {
    readonly type: "channel";
    /** What type of channels can be selected for this option. */
    channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
}

export interface IntegerOption extends BaseOption {
    readonly type: "integer";
    /** Minimum value which can be entered. */
    min?: number;
    /** Maximum value which can be entered. */
    max?: number;
    /** List of choices the user can choose from. **NOTE:** Using choices prevents the user from entering a custom value. */
    choices?: Record<string, number>;
    // TOOD: handle localization in choices
    // TODO: autocomplete
}

export interface MentionableOption extends BaseOption {
    readonly type: "mentionable";
}

export interface NumberOption extends BaseOption {
    readonly type: "number";
    /** Minimum value which can be entered. */
    min?: number;
    /** Maximum value which can be entered. */
    max?: number;
    /** List of choices the user can choose from. **NOTE:** Using choices prevents the user from entering a custom value. */
    choices?: Record<string, number>;
    // TOOD: handle localization in choices
    // TODO: autocomplete
}

export interface RoleOption extends BaseOption {
    readonly type: "role";
}

export interface StringOption extends BaseOption {
    readonly type: "string";
    /** Minimum length of string which can be entered. */
    minLength?: number;
    /** Maximum length of string which can be entered. */
    maxLength?: number;
    /** List of choices the user can choose from. **NOTE:** Using choices prevents the user from entering a custom value. */
    choices?: Record<string, string>;
    // TOOD: handle localization in choices
    // TODO: autocomplete
}

export interface UserOption extends BaseOption {
    readonly type: "user";
}

/** Union type of all slash command option types. */
type SlasherCommandOption =
    AttachmentOption |
    BooleanOption |
    ChannelOption |
    IntegerOption |
    MentionableOption |
    NumberOption |
    RoleOption |
    StringOption |
    UserOption;

export default SlasherCommandOption;
