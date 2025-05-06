import { APIApplicationCommandOptionChoice, ApplicationCommandOptionBase, ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { getIntegrationTypes, getInteractionContexts, getPermissionBits } from "./util";
import SlasherCommand, { isSlashCommand } from "./types/SlasherCommand";
import SlasherCommandOption from "./options";
import { isSubcommands, Subcommand } from "./types/SlasherSubcommands";
import { isSubcommandGroups, SubcommandGroup } from "./types/SlasherSubcommandGroups";
import SlasherContextCommand, { isContextMenuCommand } from "./types/SlasherContextMenuCommand";

export default function buildApiObject(command: SlasherCommand | SlasherContextCommand) {
    if(isSlashCommand(command)) {
        return buildApiSlashCommand(command);
    } else if(isContextMenuCommand(command)) {
        return buildApiContextCommand(command);
    } else {
        throw new Error("Can't build api object, unknown command format");
    }
}

function buildApiSlashCommand(command: SlasherCommand) {
    const builder = new SlashCommandBuilder();
    // basic details
    builder.setName(command.name)
        .setDescription(command.description)
        .setDefaultMemberPermissions(command.defaultPermissions ? getPermissionBits(command.defaultPermissions) : null)
        .setNSFW(command.nsfw ?? false);
    // add options or subcommands
    if(isSubcommands(command)) {
        for(const name in command.subcommands) {
            buildSubcommand(builder, name, command.subcommands[name]);
        }
    } else if(isSubcommandGroups(command)) {
        for(const name in command.groups) {
            buildSubcommandGroup(builder, name, command.groups[name]);
        }
    } else if(command.options) {
        for(const name in command.options) {
            buildOption(builder, name, command.options[name]);
        }
    }
    // other optional fields
    if(command.localizations?.name) builder.setNameLocalizations(command.localizations.name);
    if(command.localizations?.description) builder.setDescriptionLocalizations(command.localizations.description);
    if(command.contexts) builder.setContexts(getInteractionContexts(command.contexts));
    if(command.installScope) builder.setIntegrationTypes(getIntegrationTypes(command.installScope));
    // allow command to hook into builder
    if(command.builderHook) command.builderHook(builder);
    // finished
    return builder;
}

function buildApiContextCommand(command: SlasherContextCommand) {
    const builder = new ContextMenuCommandBuilder();
    // basic details
    builder.setName(command.name)
        .setType(command.target === "user" ? ApplicationCommandType.User : ApplicationCommandType.Message)
        .setDefaultMemberPermissions(command.defaultPermissions ? getPermissionBits(command.defaultPermissions) : null);
    // other optional fields
    if(command.nameLocalizations) builder.setNameLocalizations(command.nameLocalizations);
    if(command.contexts) builder.setContexts(getInteractionContexts(command.contexts));
    if(command.installScope) builder.setIntegrationTypes(getIntegrationTypes(command.installScope));
    // allow command to hook into builder
    if(command.builderHook) command.builderHook(builder);
    // finished
    return builder;
}

function buildOption(builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, name: string, option: SlasherCommandOption) {
    switch(option.type) {
        case "attachment":
            return builder.addAttachmentOption(attachOption => {
                return initStandardValues(attachOption, name, option)
            });
        case "boolean":
            return builder.addBooleanOption(boolOption => {
                return initStandardValues(boolOption, name, option)
            });
        case "channel":
            return builder.addChannelOption(channelOption => {
                initStandardValues(channelOption, name, option);
                if(option.channelTypes) channelOption.addChannelTypes(option.channelTypes);
                return channelOption;
            });
        case "integer":
            return builder.addIntegerOption(intOption => {
                initStandardValues(intOption, name, option);
                if(option.choices) intOption.setChoices(mapOptionChoices(option.choices));
                if(typeof option.min === "number") intOption.setMinValue(option.min);
                if(typeof option.max === "number") intOption.setMaxValue(option.max);
                return intOption;
            });
        case "mentionable":
            return builder.addMentionableOption(mentionOption => {
                return initStandardValues(mentionOption, name, option)
            });
        case "number":
            return builder.addNumberOption(numOption => {
                initStandardValues(numOption, name, option);
                if(option.choices) numOption.setChoices(mapOptionChoices(option.choices));
                if(typeof option.min === "number") numOption.setMinValue(option.min);
                if(typeof option.max === "number") numOption.setMaxValue(option.max);
                return numOption;
            });
        case "role":
            return builder.addRoleOption(roleOption => {
                return initStandardValues(roleOption, name, option)
            });
        case "string":
            return builder.addStringOption(strOption => {
                initStandardValues(strOption, name, option);
                if(option.choices) strOption.setChoices(mapOptionChoices(option.choices));
                if(typeof option.minLength === "number") strOption.setMinLength(option.minLength);
                if(typeof option.maxLength === "number") strOption.setMaxLength(option.maxLength);
                return strOption;
            });
        case "user":
            return builder.addUserOption(userOption => {
                return initStandardValues(userOption, name, option)
            });
        default:
            break;
    }
}

function buildSubcommand(builder: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder, name: string, subcommand: Subcommand) {
    return builder.addSubcommand(sub => {
        // set basic subcommand details
        sub.setName(name)
            .setDescription(subcommand.description)
            .setNameLocalizations(subcommand.localizations?.name ?? null)
            .setDescriptionLocalizations(subcommand.localizations?.description ?? null);
        // add options if required
        if(subcommand.options) {
            for(const optionName in subcommand.options) {
                buildOption(sub, optionName, subcommand.options[optionName]);
            }
        }
        return sub;
    });
}

function buildSubcommandGroup(builder: SlashCommandBuilder, name: string, subcommandGroup: SubcommandGroup) {
    return builder.addSubcommandGroup(group => {
        // set basic subcommand group details
        group.setName(name)
            .setDescription(subcommandGroup.description)
            .setNameLocalizations(subcommandGroup.localizations?.name ?? null)
            .setDescriptionLocalizations(subcommandGroup.localizations?.description ?? null);
        // add subcommands
        for(const subcommandName in subcommandGroup.subcommands) {
            buildSubcommand(group, subcommandName, subcommandGroup.subcommands[subcommandName]);
        }
        return group;
    });
}

function initStandardValues<T extends ApplicationCommandOptionBase>(builder: T, name: string, option: SlasherCommandOption) {
    return builder.setName(name)
        .setDescription(option.description)
        .setRequired(option.required ?? false)
        .setNameLocalizations(option.localizations?.name ?? null)
        .setDescriptionLocalizations(option.localizations?.description ?? null);
}

function mapOptionChoices<T>(choices: Record<string, T>): APIApplicationCommandOptionChoice<T>[] {
    return Object.keys(choices)
        .map(name => ({ name, value: choices[name] }));
}
