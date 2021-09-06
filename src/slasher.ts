#!/usr/bin/env node
import * as fs from 'fs';
import * as colors from 'ansi-colors';
import * as Types from './command-tree';
import * as readline from 'readline';
import { Writable } from 'stream';
import CommandPreview from './command-preview';

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

type DiscordChoice = {
    name: string,
    value: string | number
};

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

        // remove json schema field
        if(commandData["$schema"]) {
            delete commandData["$schema"];
        }
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

    // generate possible command list
    console.log("Calculating full command list...");
    let preview = new CommandPreview();
    let commands: string[] = [];

    getPossibleCommands(commandData, commands, preview);

    console.log();
    console.log(colors.bold.yellow("Command tree has been evaluated, these are the possible commands:"));
    console.log(commands.map(s => colors.yellow("  /" + s)).join("\n"));
    console.log();

    let muted = new BooleanRef(false);
    let rl = promised(readline.createInterface({
        input: process.stdin,
        output: new Writable({
            write: (chunk, encoding, cb) => {
                if(muted.get()) {
                    let len = 1;
                    if(chunk.length) {
                        len = chunk.length;
                    }
                    let txt = Array(chunk).map(s => "*").join("");
                    process.stdout.write(Buffer.from(txt));
                } else {
                    process.stdout.write(chunk, encoding);
                }
                cb();
            }
        }),
        terminal: true 
    }));

    let confirm = await yesNo(colors.yellow("Are these correct? (y/n)"), rl);
    if(!confirm) {
        console.log();
        console.log(colors.red("Cancelled"));
        return process.exit(0);
    }

    // check if they are uploading guild or global commands
    console.log();
    console.log(colors.yellow.bold("How would you like to upload the commands?"));
    console.log(colors.yellow("  1. For a specific server (updates instantly - use for testing)"));
    console.log(colors.yellow("  2. For all servers       (may take up to an hour to update)"));
    console.log();

    let num: number = -1;
    while(num != 1 && num != 2) {
        let init = num == -1;
        let ans = await rl.question(init ? colors.yellow("Please choose an option (1/2) ") : colors.red("Please enter either 1 or 2: "));
        let n = Number(ans);
        if(isNaN(n)) {
            num = -2;
        } else {
            num = n;
        }
    }
    let updateGlobal = num === 2;
    
    console.log();

    let token = await tokenInput(colors.yellow("Please enter your bot's token (that you would use to log into it): "), rl, muted);
    let guild = "";
    if(!updateGlobal) {
        guild = await rl.question(colors.yellow("Please enter the ID of the server to update (right click on server and copy ID): "));
    }

    // confirm before performing the update
    console.log();
    console.log(colors.yellow.bold("Great! Your bot's commands will now be updated " + (updateGlobal ? "globally" : "for your server")));
    if(updateGlobal) {
        console.log(colors.yellow("(Please note that it may take up to an hour for your changes to be applied)"));
    }
    console.log();
    
    confirm = await yesNo(colors.yellow("Are you ready to proceed? (y/n): "), rl);
    if(!confirm) {
        console.log();
        console.log(colors.red("Cancelled"));
        return process.exit(0);
    }

    // generate discord json and send request
    let data = generateDiscordJson(commandData);

    console.log();
    console.log(JSON.stringify(data, null, 4));

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
            let type = null;
            for(let choiceName in option.choices) {
                if(typeof choiceName !== "string") return prefix + "choice \"" + choiceName + "\": name must be string";
                if(typeof option.choices[choiceName] !== "string" && typeof option.choices[choiceName] !== "number") {
                    return prefix + "choice \"" + choiceName + "\": value must be string or integer";
                }
                if(type) {
                    if(typeof option.choices[choiceName] !== type) return prefix + "choice \"" + choiceName + "\": all choices must have same type";
                } else {
                    type = typeof option.choices[choiceName];
                }
                if(typeof option.choices[choiceName] === "number" && !Number.isInteger(option.choices[choiceName])) {
                    return prefix + "choice \"" + choiceName + "\": numeric value must be integer";
                }
            }
        } else if(typeof option.type !== "string") {
            return prefix + "type must be defined if no choices are provided";
        } else if(!OPTION_TYPE_TEST.includes(option.type)) {
            return prefix + "type must be one of: " + OPTION_TYPE_TEST.join(", ");
        }
        return null;
    }

    function validateOptions(cmd: Types.Command | Types.Subcommand, commandName: string) {
        for(let optionName in cmd.options) {
            // test name against regex
            if(!namePat.test(optionName)) {
                track("command \"" + commandName + "\" option \"" + optionName + "\": option name is invalid");
                continue;
            }

            // test basic option data
            let optionBasic = cmd.options[optionName];
            let optionPrefix = "command \"" + commandName + "\" option \"" + optionName + "\": ";
            track(validateOptionBasic(optionPrefix, optionBasic));

            // determine if option is subcommand or subcommand group
            let option      = optionBasic as Types.Option;
            let subcmd      = optionBasic as Types.Subcommand;
            let subcmdGroup = optionBasic as Types.SubcommandGroup;
            
            if(subcmdGroup.subcommands) {
                // option is subcommand group
                for(let scmd in subcmdGroup.subcommands) {
                    let subg = subcmdGroup.subcommands[scmd] as Types.SubcommandGroup;
                    if(subg.subcommands) {
                        track("command \"" + commandName + "\" subcommand group \"" + optionName + "\": subcommand group cannot contain subcommand group");
                        continue;
                    }
                    let subc = subcmdGroup.subcommands[scmd] as Types.Subcommand;
                    if(typeof subc !== "object" || (!subc.options && !subc.subcommand)) {
                        track("command \"" + commandName + "\" subcommand group \"" + optionName + "\" subcommand \"" + scmd + "\": must be a subcommand object");
                        continue;
                    }
                }
                validateOptions({ description: subcmdGroup.description, options: subcmdGroup.subcommands }, commandName + "/" + optionName);
            } else if(subcmd.options || subcmd.subcommand) {
                // option is subcommand
                validateOptions(subcmd, commandName + "/" + optionName);
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

function getPossibleCommands(tree: Types.CommandTree, commands: string[], preview: CommandPreview) {
    for(let commandName in tree) {
        preview.push(commandName);
        let command = tree[commandName] as Types.Command;

        if(!command.options) {
            commands.push(preview.get());
        } else {
            getPossibleOptionCommands(command.options, commands, preview);
        }

        preview.pop();
    }
}

function getPossibleOptionCommands(options: Types.OptionList, commands: string[], preview: CommandPreview) {
    let offset = 0;
    for(let optionName in options) {
        if(!options[optionName]) {
            offset++;
            continue;
        }

        let option = options[optionName] as Types.Option;
        let subcmd = options[optionName] as Types.Subcommand;
        let subcmdGroup = options[optionName] as Types.SubcommandGroup;

        if(subcmdGroup.subcommands) {
            preview.push(optionName);
            getPossibleOptionCommands(subcmdGroup.subcommands, commands, preview);
        } else if(subcmd.options) {
            preview.push(optionName);
            getPossibleOptionCommands(subcmd.options, commands, preview);
        } else if(subcmd.subcommand) {
            preview.push(optionName);
        } else {
            let required = typeof option.required === "boolean" && option.required;
            preview.push((!required ? "?" : "") + optionName);
        }
    }
    commands.push(preview.get());
    for(let i = 0; i < Object.keys(options).length - offset; i++) {
        preview.pop();
    }
}

function generateDiscordJson(tree: Types.CommandTree) {
    let commands = [];
    for(let commandName in tree) {
        let command = tree[commandName];
        let options: any[];

        if(typeof command.options === "object") {
            options = generateOptionJson(command.options);
        }

        commands.push({
            name: commandName,
            description: command.description,
            options: options ? options : undefined
        });
    }
    return commands;
}

function generateOptionJson(options: Types.OptionList) {
    let optionData = [];

    for(let optionName in options) {
        let option = options[optionName];
        let type: number;
        let required: boolean;
        let choices: DiscordChoice[];

        let subg = option as Types.SubcommandGroup;
        let subc = option as Types.Subcommand;
        let opt  = option as Types.Option;

        if(subg.subcommands) {
            // is a subcommand group
            type = OPTION_TYPES["subcommand_group"];
            
            let optionsArray = generateOptionJson(subg.subcommands);
            optionData.push({
                name: optionName,
                description: option.description,
                type, options: optionsArray
            });
        } else if(subc.options || subc.subcommand) {
            // is a subcommand
            type = OPTION_TYPES["subcommand"];
            
            let optionsArray: any[] = undefined;
            if(subc.options) {
                optionsArray = generateOptionJson(subc.options);
            }

            optionData.push({
                name: optionName,
                description: option.description,
                type, options: optionsArray
            });
        } else {
            // is a regular option
            if(opt.choices) {
                let first = opt.choices[Object.keys(opt.choices)[0]];
                type = typeof first === "string" ? OPTION_TYPES["string"] : OPTION_TYPES["integer"];
                choices = Object.keys(opt.choices).map((name): DiscordChoice => {
                    return { name, value: opt.choices[name] };
                });
            } else {
                type = OPTION_TYPES[opt.type];
            }
            if(opt.required) {
                required = opt.required;
            }

            // add option data
            optionData.push({
                name: optionName,
                description: option.description,
                type, required, choices
            });
        }
    }

    return optionData;
}

//------------------------------------------------------------------------------------//

async function yesNo(query: string, intf: PromisedInterface) {
    let answer: string;
    while(answer != "y" && answer != "n" && answer != "yes" && answer != "no") {
        let q = answer ? colors.red("Please enter one of: (y, n, yes, no): ") : query + " ";
        answer = (await intf.question(q)).toLowerCase();
    }
    return answer == "y" || answer == "yes";
}

function tokenInput(query: string, intf: PromisedInterface, muted: BooleanRef) {
    return new Promise((resolve) => {
        intf.reference.question(query, (answer) => {
            muted.set(false);
            process.stdout.write("\n");
            resolve(answer);
        });
        muted.set(true);
    });
}

type PromisedInterface = {
    reference: readline.Interface,
    question: (query: string) => Promise<string>
};

function promised(intf: readline.Interface): PromisedInterface {
    return {
        reference: intf,
        question: (query: string): Promise<string> => {
            return new Promise((resolve) => {
                intf.question(query, (answer) => {
                    resolve(answer);
                })
            });
        }
    };
}

class BooleanRef {
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    set(value: boolean) {
        this.value = value;
    }

    get() {
        return this.value;
    }
}