#!/usr/bin/env node
import * as fs from 'fs';
import * as colors from 'ansi-colors';
import * as Types from './command-tree';
import * as readline from 'readline';
import { Writable } from 'stream';
import CommandPreview from './command-preview';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Permissions } from 'discord.js';

const OPTION_TYPES = {
    "subcommand": 1,
    "subcommand_group": 2,
    "string": 3,
    "integer": 4,
    "boolean": 5,
    "user": 6,
    "channel": 7,
    "role": 8,
    "mentionable": 9,
    "number": 10
};
const OPTION_TYPE_TEST = Object.keys(OPTION_TYPES).filter(s => s !== "subcommand" && s !== "subcommand_group");

const CHANNEL_TYPES = {
    "text": 0,
    "dm": 1,
    "voice": 2,
    "group_dm": 3,
    "category": 4,
    "announcements": 5,
    "store": 6,
    "announcement_thread": 10,
    "public_thread": 11,
    "private_thread": 12,
    "stage": 13
};
const NUM_CHANNEL_TYPES = Object.keys(CHANNEL_TYPES).length;

const PERMISSION_TYPES = Object.keys(Permissions.FLAGS);
const PERMISSION_LIST_URL = "https://github.com/Romejanic/slasher/blob/master/docs/guides/command-json.md#permission-list";

type DiscordChoice = {
    name: string,
    value: string | number
};
type ExistingCommand = {
    id: string,
    name: string
};

(async () => {
    console.log("S/ASHER " + require("../../package.json").version + " by Romejanic");
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

    // perform dry run if option is passed
    if(process.argv.includes("--dry-run")) {
        let data = generateDiscordJson(commandData);
        let json = JSON.stringify(data, null, 4);
        console.log(colors.gray("Dry run complete, generated Discord JSON:"));
        console.log(colors.yellow(json));
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

    let token: string;
    let client: string;
    let guild: string = undefined;

    // check if the auth.json file exists
    if(fs.existsSync("auth.json")) {
        // file exists, use it's details
        let data = await fs.promises.readFile("auth.json");
        let json = JSON.parse(data.toString());
        token = json.token;
        client = json.client;
        guild = json.guild;

        // if the user hasn't saved a guild id yet, we'll still need
        // to prompt the user for it, then save it to the file
        if(!guild && !updateGlobal) {
            guild = await rl.question(colors.yellow("Please enter the ID of the server to update (right click on server and copy ID): "));

            // write to json
            json.guild = guild;
            try {
                await fs.promises.writeFile("auth.json", JSON.stringify(json, null, 4));
            } catch(e) { /* this can just silently fail */ }
        }
    } else {
        // doesn't exist, prompt the user for it
        token = await tokenInput(colors.yellow("Please enter your bot's token (that you would use to log into it): "), rl, muted);
        client = await rl.question(colors.yellow("Please enter the ID of your bot's account (right click on your bot and copy ID): "));
        if(!updateGlobal) {
            guild = await rl.question(colors.yellow("Please enter the ID of the server to update (right click on server and copy ID): "));
        }
    }

    // prompt user to save details
    await askToSave(token, client, guild, rl);

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
    console.log(colors.gray("Please wait..."));

    let rest = new REST({ version: '10' }).setToken(token);
    try {
        let route = updateGlobal ? Routes.applicationCommands(client) : Routes.applicationGuildCommands(client, guild);

        // let existingCommands: ExistingCommand[] = (await rest.get(route)) as ExistingCommand[];
        // let commandsToDelete = existingCommands.filter(cmd => typeof commandData[cmd.name] === "undefined");
        // console.log(existingCommands, commandsToDelete);

        await rest.put(route, { body: data });
        console.log(colors.green.bold("Done! You should see the updated commands in Discord soon."));
    } catch(e) {
        console.log(colors.red.bold("Error updating commands with Discord!"));
        console.log(colors.red("Please check the following error as it may be an issue with your command tree."));
        console.log();
        console.log(colors.red(e));
    }

    process.exit(0);

})();

async function askToSave(token: string, client: string, guild: string, intf: PromisedInterface) {
    async function appendToGitIgnore() {
        const gitignore = "\n# Bot Authorisation File\n/auth.json"; 
        await new Promise<Error | void>((resolve, reject) => {
            fs.appendFile(".gitignore", gitignore, (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        console.log();
        console.log(colors.red("## NOTE ##"));
        console.log(colors.red("An entry for auth.json was added to your .gitignore file."));
        console.log(colors.red.bold("If you use a different version control system, add it to the ignore file!"));
        console.log(colors.red.bold("NEVER EVER EVER " + colors.underline.red.bold("EVER") + " commit auth.json to your repository!!!!"));
        console.log(colors.red("Doing so could make your bot token public, and open it up to being hijacked. Not good!"));
    }

    if(fs.existsSync("auth.json")) {
        // check if it's in the gitignore
        if(await authFileNotInGitIgnore()) {
            await appendToGitIgnore();
        }
    } else {
        console.log();
        let confirm = await yesNo(colors.yellow("Would you like to save these details for future use? (y/n):"), intf);
        if(confirm) {
            // append entry to gitignore
            try {
                if(await authFileNotInGitIgnore()) {
                    await appendToGitIgnore();
                }
            } catch(e) {
                console.log(colors.red.bold("Failed to append entry to gitignore file!"));
                console.log(colors.bold("For security reasons the details were not saved"));
                return;
            }
            // write json to file
            await new Promise<Error | void>((resolve, reject) => {
                let json = JSON.stringify({
                    token, client, guild
                }, null, 4);
                fs.writeFile("auth.json", json, (err) => {
                    if(err) reject(err);
                    else resolve();
                });
            });
            console.log(colors.green("Saved bot login details to auth.json!"));
        }
    }
}

function validateTree(tree: Types.CommandTree) {
    // define separate validation functions
    function validateCommand(prefix: string, command: Types.Command) {
        if(typeof command !== "object") return prefix + "command must be object"
        if(!command.description) return prefix + "requires a description!";
        if(typeof command.description !== "string") return prefix + "description must be string";
        if(command.options && typeof command.options !== "object") return prefix + "options must be object";
        if(command.permissions && typeof command.permissions !== "object") return prefix + "permissions must be object";
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
        let type = null;
        if(option.choices) {
            if(typeof option.choices !== "object") return prefix + "choices must be object";
            for(let choiceName in option.choices) {
                if(typeof choiceName !== "string") return prefix + "choice \"" + choiceName + "\": name must be string";
                if(typeof option.choices[choiceName] !== "string" && typeof option.choices[choiceName] !== "number") {
                    return prefix + "choice \"" + choiceName + "\": value must be string or number";
                }
                if(type) {
                    if(typeof option.choices[choiceName] !== type) return prefix + "choice \"" + choiceName + "\": all choices must have same type";
                } else {
                    type = typeof option.choices[choiceName];
                }
            }
        } else if(option.channel_types) {
            if(!Array.isArray(option.channel_types)) return prefix + "channel_types must be array";
            if(option.channel_types.length < 1 || option.channel_types.length > NUM_CHANNEL_TYPES) return prefix + "channel_types must have between 1 and " + NUM_CHANNEL_TYPES + " types";
            if(option.channel_types.some(k => typeof CHANNEL_TYPES[k] === "undefined")) return prefix + "each element of channel_types must be one of: " + Object.keys(CHANNEL_TYPES).join(", ");
            // get unique values only
            option.channel_types = option.channel_types.filter((v,i,s) => s.indexOf(v) === i);
        } else if(typeof option.type !== "string") {
            return prefix + "type must be defined if no choices are provided";
        } else if(!OPTION_TYPE_TEST.includes(option.type)) {
            return prefix + "type must be one of: " + OPTION_TYPE_TEST.join(", ");
        } else if(option.type === "integer" || option.type === "number") {
            if(option.min && typeof option.min !== "number") return prefix + "min must be a number";
            if(option.max && typeof option.max !== "number") return prefix + "max must be a number";
            if(option.max < option.min) return prefix + "min should be smaller than max";
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

    function validatePermissions(cmd: Types.Command, cmdName: string) {
        const { permissions } = cmd;
        if(typeof permissions.dm !== "undefined" && typeof permissions.dm !== "boolean") track(`${cmdName}: permissions.dm must be a boolean`);
        if(typeof permissions.disabled !== "undefined" && typeof permissions.disabled !== "boolean") track(`${cmdName} permissions.disabled must be a boolean`);
        if(permissions.requires) {
            if(Array.isArray(permissions.requires)) {
                if(permissions.requires.some(v => typeof v !== "string")) return track(`${cmdName} permissions.requires: each item must be a string`);
                let permBits = new Permissions();
                let uniquePerms = permissions.requires.filter((v,i,a) => a.indexOf(v) === i);
                for(let v of uniquePerms) {
                    if(!PERMISSION_TYPES.includes(v)) return track(`${cmdName} permissions.requires: invalid permission '${v}'. Please refer to ${PERMISSION_LIST_URL} for a list of permissions.`);
                    permBits.add(v);
                };
                cmd.permissions.permission_value = permBits;
            } else {
                track(`${cmdName}: permissions.requires must be an array`);
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

        // test options and permissions
        if(cmd.options) {
            validateOptions(cmd, commandName);
        }
        if(cmd.permissions) {
            validatePermissions(cmd, commandName);
        }
    }

    return errors;
}

function getPossibleCommands(tree: Types.CommandTree, commands: string[], preview: CommandPreview) {
    // for the first release just keep it simple,
    // only lists the command names
    commands.push(...Object.keys(tree));

    // for(let commandName in tree) {
    //     preview.push(commandName);
    //     let command = tree[commandName] as Types.Command;

    //     if(!command.options) {
    //         commands.push(preview.get());
    //     } else {
    //         getPossibleOptionCommands(command.options, commands, preview);
    //     }

    //     preview.pop();
    // }
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

        let default_member_permissions: string = undefined;
        let dm_permission: boolean = undefined;

        if(typeof command.permissions === "object") {
            if(command.permissions.disabled) default_member_permissions = "0";
            else if(command.permissions.permission_value) {
                default_member_permissions = command.permissions.permission_value.bitfield.toString();
            }
            if(typeof command.permissions.dm === "boolean") dm_permission = command.permissions.dm;  
        }

        commands.push({
            type: 1,
            name: commandName,
            description: command.description,
            options: options ? options : undefined,
            default_member_permissions, dm_permission
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
        let channel_types: number[];

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
                type = typeof first === "string" ? OPTION_TYPES["string"] : OPTION_TYPES["number"];
                choices = Object.keys(opt.choices).map((name): DiscordChoice => {
                    return { name, value: opt.choices[name] };
                });
            } else if(opt.channel_types) {
                type = OPTION_TYPES["channel"];
                channel_types = opt.channel_types.map(v => CHANNEL_TYPES[v]);
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
                type, required, choices, channel_types
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

function tokenInput(query: string, intf: PromisedInterface, muted: BooleanRef): Promise<string> {
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

async function authFileNotInGitIgnore() {
    const file = ".gitignore";
    if(!fs.existsSync(file)) return true;
    
    const data = await fs.promises.readFile(file);
    return !data.toString().includes("/auth.json");
}