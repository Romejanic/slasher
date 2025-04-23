import { APIApplicationCommand, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import {diff} from "deep-object-diff";

export default function checkCommandDiff(def: RESTPostAPIApplicationCommandsJSONBody, apiCmd: APIApplicationCommand) {
    // remove fields which are not required for comparison
    const cmdData = structuredClone(apiCmd);
    delete cmdData["id"];
    delete cmdData["application_id"];
    delete cmdData["version"];
    delete cmdData["guild_id"];
    // add empty options array if it doesn't exist
    if(!cmdData["options"]) cmdData["options"] = [];
    // check objects are the same
    // (ignore undefined diffs)
    const objDiff = diff(cmdData, def);
    for(const key in objDiff) {
        if(typeof objDiff[key] !== "undefined") return false;
    }
    return true;
}
