import { APIApplicationCommandOptionChoice, ApplicationCommandOptionBase, SlashCommandBuilder } from "discord.js";
import { getIntegrationTypes, getInteractionContexts, getPermissionBits } from "./util";
import SlasherCommand from "./types/SlasherCommand";
import SlasherCommandOption from "./options";

export default function buildApiCommand(command: SlasherCommand) {
    const builder = new SlashCommandBuilder();
    // basic details
    builder.setName(command.name)
        .setDescription(command.description)
        .setDefaultMemberPermissions(command.defaultPermissions ? getPermissionBits(command.defaultPermissions) : null)
        .setNSFW(command.nsfw ?? false);
    // add options
    if(command.options) {
        for(const name in command.options) {
            buildOption(builder, name, command.options[name]);
        }
    }
    // other optional fields
    if(command.localizations?.name) builder.setNameLocalizations(command.localizations.name);
    if(command.localizations?.description) builder.setDescriptionLocalizations(command.localizations.description);
    if(command.contexts) builder.setContexts(getInteractionContexts(command.contexts));
    if(command.installScope) builder.setIntegrationTypes(getIntegrationTypes(command.installScope));
    // finished
    return builder;
}

function buildOption(builder: SlashCommandBuilder, name: string, option: SlasherCommandOption) {
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
