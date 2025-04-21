import { APIApplicationCommand } from "discord.js";
import { SlasherCommand } from ".";

export default function checkCommandDiff(def: SlasherCommand, apiCmd: APIApplicationCommand) {
    if(def.name !== apiCmd.name) return true;
    if(def.description !== apiCmd.description) return true;
    return false;
}
