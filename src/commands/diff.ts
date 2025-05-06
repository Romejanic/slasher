import { APIApplicationCommand, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { detailedDiff } from "deep-object-diff";

// list of API properties to populate if they are missing
const populateUndefined: Array<keyof APIApplicationCommand> = [
    "name_localizations",
    "description_localizations",
    "contexts",
    "default_permission",
    "dm_permission",
    "integration_types"
];

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
    // populate undefined properties
    for(const key of populateUndefined) {
        // @ts-ignore
        if(typeof cmdData[key] === "undefined") cmdData[key] = undefined;
    }
    // add empty options array if it doesn't exist
    if(!cmdData["options"]) cmdData["options"] = [];
    // check objects are the same
    // (ignore undefined diffs)
    const objDiff = detailedDiff(cmdData, def);
    if(!isObjectEmpty(objDiff.added)) return filterAdded(objDiff.added);
    if(!isObjectEmpty(objDiff.deleted)) return false;
    if(!isObjectEmpty(objDiff.updated)) return false;
    return true;
}

function isObjectEmpty(obj: object) {
    return Object.keys(obj).length === 0;
}

function filterAdded(diff: object) {
    if(typeof diff !== "object") return false;
    if(Array.isArray(diff)) {
        for(const index in diff) {
            if(!filterAdded(diff[index])) return false;
        }
        return true;
    }
    for(const key in diff) {
        switch(typeof diff[key]) {
            case "object": return filterAdded(diff[key]);
            case "undefined": break;
            default: return false;
        }
    }
    return true;
}
