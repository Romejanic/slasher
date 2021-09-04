#!/usr/bin/env node
import * as fs from 'fs';
import * as colors from 'ansi-colors';
import * as Types from './command-tree';

const OPTION_TYPES = {
    "subcommand": 1,
    "subcommand_group": 2,
    "string": 3,
    "integer": 4,
    "boolean": 5,
    "user": 6,
    "channel": 7,
    "role": 8,
    "mentionable": 9
};
const OPTION_TYPE_TEST = Object.keys(OPTION_TYPES).filter(s => s !== "subcommand" && s !== "subcommand_group");

(async () => {
    console.log("S/ASHER " + require("../package.json").version + " by Romejanic");
    console.log();

    // check the command definition exists
    if(!fs.existsSync("commands.json")) {
        console.error(colors.red("!! ERROR !!"));
        console.error(colors.red("You do not have a command file in your project!"));
        console.error(colors.red("Please create a " + colors.bold.red("commands.json") + " file in the base of your project."));
        return;
    }

    // read file and parse JSON
    let commandData: Types.CommandTree;
    try {
        let data = await fs.promises.readFile("commands.json");
        commandData = JSON.parse(data.toString());
    } catch(e) {
        console.error(colors.red("Failed to load your command.json file!"));
        console.error();
        console.error(colors.red(e));
    }

    // start analysing file
    console.log("Validating command tree...");
    let errors = validateTree(commandData);

    if(errors.length > 0) {
        console.error(colors.red("Failed to validate the command tree!"));
        console.error();
        console.error(errors.map(e => colors.red(e)).join("\n"));
        return;
    }


})();

function validateTree(tree: Types.CommandTree) {
    // define separate validation functions
    function validateCommand(prefix: string, command: Types.Command) {
        if(typeof command !== "object") return prefix + "command must be object"
        if(!command.description) return prefix + "requires a description!";
        if(typeof command.description !== "string") return prefix + "description must be string";
        if(command.options && typeof command.options !== "object") return prefix + "options must be object";
        return null;
    }
    function validateOptionBasic(prefix: string, option: Types.Option) {
        if(typeof option !== "object") return prefix + "option must be object";
        if(!option.description) return prefix + "requires a description!";
        if(typeof option.description !== "string") return prefix + "description must be string";
        return null;
    }
    function validateOption(prefix: string, option: Types.Option) {
        if(typeof option.required !== "undefined" && typeof option.required !== "boolean") return prefix + "required must be boolean";
        if(option.choices) {
            if(typeof option.choices !== "object") return prefix + "choices must be object";
        } else if(typeof option.type !== "string") {
            return prefix + "type must be defined if no choices are provided";
        } else if(!OPTION_TYPE_TEST.includes(option.type)) {
            return prefix + "type must be one of: " + OPTION_TYPE_TEST.join(", ");
        }
        return null;
    }

    function validateOptions(cmd: Types.Command, commandName: string) {
        for(let optionName in cmd.options) {
            // test name against regex
            if(!namePat.test(optionName)) {
                track("command \"" + commandName + "\" option \"" + optionName + "\": option name is invalid");
                continue;
            }

            // test basic option data
            let optionBasic = cmd.options[optionName];
            let optionPrefix = "command \"" + cmd + "\" option \"" + optionName + "\": ";
            track(validateOptionBasic(optionPrefix, optionBasic));

            // determine if option is subcommand or subcommand group
            let option      = optionBasic as Types.Option;
            let subcmd      = optionBasic as Types.Subcommand;
            let subcmdGroup = optionBasic as Types.SubcommandGroup;

            if(subcmdGroup.subcommands) {
                // option is subcommand group

            } else if(subcmd.options || subcmd.subcommand) {
                // option is subcommand

            } else {
                // option is option (lol)
                track(validateOption(optionPrefix, option));
            }

        }
    }

    // add error tracking
    let errors = [];
    function track(error: string) {
        if(error) errors.push(error);
    }

    // start validation
    let namePat = /^[\w-]{1,32}$/;
    for(let commandName in tree) {
        // test name against regex
        if(!namePat.test(commandName)) {
            track("command \"" + commandName + "\": command name is invalid");
            continue;
        }

        // test basic command data
        let cmd = tree[commandName];
        let cmdPrefix = "command \"" + commandName + "\": ";
        track(validateCommand(cmdPrefix, cmd));

        // test options
        if(cmd.options) {
            validateOptions(cmd, commandName);
        }
    }

    return errors;
}