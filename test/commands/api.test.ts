import { describe, expect, test } from "bun:test";
import buildApiSlashCommand from "../../src/commands/api";
import { ApplicationCommandType, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

describe("api.ts", () => {

    test("buildApiCommand()", () => {
        const builder = buildApiSlashCommand({
            name: "my-command",
            description: "A new type of command",
            execute() {}
        });
        expect(builder).toBeObject();
        expect(builder.toJSON()).toMatchObject({
            name: "my-command",
            description: "A new type of command",
            type: ApplicationCommandType.ChatInput
        } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody);
    });

});
