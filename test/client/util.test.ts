import { describe, expect, test } from "bun:test";
import { makeErrorEmbed } from "../../src/client/util";

describe("util.ts", () => {

    test("makeErrorEmbed()", () => {
        const embed = makeErrorEmbed("Test Error", "This is an error embed");
        expect(embed).toBeObject();
        expect(embed.data.title).toBe("Test Error");
        expect(embed.data.description).toBe("This is an error embed");
        expect(embed.data.color).toBe(0xed4245);
    });

});
