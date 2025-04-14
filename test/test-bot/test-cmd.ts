import { type SlasherCommand } from "../../src/commands";

const testCommand: SlasherCommand = {

    name: "test",
    description: "A test of Slasher v2",

    async execute(ctx) {
        ctx.command.reply({
            content: "Hello world"
        });
    }

};

export default testCommand;
