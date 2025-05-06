import { describe, expect, test } from "bun:test";
import { APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
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

    // test("options", () => {
    //     const def: RESTPostAPIApplicationCommandsJSONBody = {
    //         name: "foo",
    //         description: "a description",
    //         type: ApplicationCommandType.ChatInput,
    //         nsfw: false,
    //         options: [
    //             {
    //                 type: ApplicationCommandOptionType.String,
    //                 name: "firstop",
    //                 description: "a different option"
    //             }
    //         ]
    //     };
    //     const apiCmd: APIApplicationCommand = {
    //         id: "12345678",
    //         name: "foo",
    //         description: "a description",
    //         type: ApplicationCommandType.ChatInput,
    //         nsfw: false,
    //         version: "1",
    //         application_id: "1234567",
    //         default_member_permissions: null,
    //         options: [
    //             {
    //                 type: ApplicationCommandOptionType.String,
    //                 name: "firstop",
    //                 description: "a different option"
    //             }
    //         ]
    //     };
    //     expect(checkCommandDiff(def, apiCmd)).toBeTrue();
    //     expect(checkCommandDiff());
    // });

});
