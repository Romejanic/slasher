import { describe, expect, test } from "bun:test";
import { APIApplicationCommand, APIApplicationCommandStringOption, ApplicationCommandOptionType, ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import checkCommandDiff from "../../src/commands/diff";

describe("diff.ts - checkCommandDiff()", () => {

    test("basic", () => {
        const def = new SlashCommandBuilder()
            .setName("foo")
            .setDescription("a description")
            .setNSFW(false)
            .setDefaultMemberPermissions(null)
            .toJSON();
        const apiCmd: APIApplicationCommand = {
            id: "12345678",
            name: "foo",
            description: "a description",
            type: ApplicationCommandType.ChatInput,
            nsfw: false,
            version: "1",
            application_id: "1234567",
            default_member_permissions: null
        };
        expect(checkCommandDiff(def, apiCmd)).toBeTrue();
        expect(checkCommandDiff({ ...def, name: "bar" }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({ ...def, description: "a different desc" }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({ ...def, nsfw: true }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({ ...def, default_member_permissions: "32" }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({ ...def, type: ApplicationCommandType.Message }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({ ...def, type: ApplicationCommandType.User }, apiCmd)).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, name: "bar" })).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, description: "a different desc" })).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, nsfw: true })).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, default_member_permissions: "32" })).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, type: ApplicationCommandType.Message })).toBeFalse();
        expect(checkCommandDiff(def, { ...apiCmd, type: ApplicationCommandType.User })).toBeFalse();
    });

    test("options", () => {
        const def = new SlashCommandBuilder()
            .setName("foo")
            .setDescription("a description")
            .setNSFW(false)
            .setDefaultMemberPermissions(null)
            .addStringOption(option => option
                .setName("firstop")
                .setDescription("a different option"))
            .toJSON();
        const apiCmd: APIApplicationCommand = {
            id: "12345678",
            name: "foo",
            description: "a description",
            type: ApplicationCommandType.ChatInput,
            nsfw: false,
            version: "1",
            application_id: "1234567",
            default_member_permissions: null,
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "firstop",
                    description: "a different option",
                    required: false
                }
            ]
        };
        expect(checkCommandDiff(def, apiCmd)).toBeTrue();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                name: "anotherop"
            }]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                description: "different desc"
            }]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                required: true
            }]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                type: ApplicationCommandOptionType.Integer,
                choices: undefined
            }]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                choices: [
                    { name: "Foo", value: "abc" },
                    { name: "Bar", value: "def" }
                ]
            } as APIApplicationCommandStringOption]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                min_length: 2,
                max_length: 10
            } as APIApplicationCommandStringOption]
        }, apiCmd)).toBeFalse();
        expect(checkCommandDiff({
            ...def,
            options: [{
                ...def.options[0],
                autocomplete: true
            } as APIApplicationCommandStringOption]
        }, apiCmd)).toBeFalse();
    });

});
