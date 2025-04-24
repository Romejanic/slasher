import { APIApplicationCommand, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import {diff} from "deep-object-diff";

/**
 * Compares a defined command with an API command and determines if they are equal.
 * @param def The command definition to check
 * @param apiCmd The API command to compare against
 * @returns true if the commands are the same, false otherwise
 */
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
    return checkObjectDiff(objDiff);
}

function checkObjectDiff(diff: object) {
    if(diff === null || typeof diff === "undefined") return true;
    // special case for array
    if(Array.isArray(diff)) {
        return diff.reduce<boolean>((flag, val) => flag && checkObjectDiff(val), true);
    }
    // compare each key in diff
    for(const key in diff) {
        if(typeof diff[key] !== "undefined" || diff[key] === null) {
            if(typeof diff[key] === "object") {
                return checkObjectDiff(diff[key]);
            } else {
                return false;
            }
        }
    }
    return true;
}
