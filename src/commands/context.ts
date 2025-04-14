import { CommandInteraction } from "discord.js";

export default interface CommandContext {

    /** The orginal command interaction object from discord.js */
    command: CommandInteraction;

}
