import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction } from "discord.js";
import SlasherClient from ".";
import SlasherCommand from "../commands/types/SlasherCommand";
import { isSubcommandGroups } from "../commands/types/SlasherSubcommandGroups";
import { isSubcommands } from "../commands/types/SlasherSubcommands";
import { makeErrorEmbed } from "./util";
import { isContextMenuCommand } from "../commands/types/SlasherContextMenuCommand";

export default async function dispatchInteraction(client: SlasherClient, commands: SlasherCommand[], i: Interaction) {
    if(i.isChatInputCommand()) {
        await dispatchChatCommand(commands, i);
    } else if(i.isContextMenuCommand()) {
        await dispatchContextCommand(commands, i);
    }
}

async function dispatchChatCommand(commands: SlasherCommand[], i: ChatInputCommandInteraction) {
    const cmd = commands.find(v => v.name === i.commandName);
    if(cmd) {
        try {
            if(isSubcommands(cmd)) {
                const subcommandName = i.options.getSubcommand(true);
                if(subcommandName in cmd.subcommands) {
                    await cmd.subcommands[subcommandName].execute(i);
                } else {
                    throw new Error("TODO replace with real response");
                }
            } else if(isSubcommandGroups(cmd)) {
                const subcommandName = i.options.getSubcommand(true);
                const groupName = i.options.getSubcommandGroup(true);
                if(groupName in cmd.groups && subcommandName in cmd.groups[groupName].subcommands) {
                    await cmd.groups[groupName].subcommands[subcommandName].execute(i);
                } else {
                    throw new Error("TODO replace with real response");
                }
            } else if(isSubcommands(cmd)) {
                await cmd.execute(i);
            } else {
                // this isn't a chat command
                throw new Error("TODO replace with real response");
            }
        } catch(e) {
            this.logger.error("Error while running command", e);
            const embed = makeErrorEmbed("Error running command", "Sorry, an error occurred while running this command. If the problem persists please contact the bot developer.");
            if(i.replied || i.deferred) await i.editReply({ embeds: [embed] });
            else await i.reply({ embeds: [embed] });
        }
    } else {
        this.logger.warn(`Unknown command /${i.commandName}, commands may be out of date`);
        const embed = makeErrorEmbed("Command not found", "Sorry, this command does not exist. Please contact the bot developer if you believe this is in error.");
        await i.reply({ embeds: [embed] });
    }
}

async function dispatchContextCommand(commands: SlasherCommand[], i: ContextMenuCommandInteraction) {
    const cmd = commands.find(v => v.name === i.commandName);
    if(cmd) {
        try {
            if(isContextMenuCommand(cmd)) {
                if(cmd.target === "user" && i.isUserContextMenuCommand()) {
                    await cmd.execute(i);
                } else if(cmd.target === "message" && i.isMessageContextMenuCommand()) {
                    await cmd.execute(i);
                } else {
                    throw new Error("Invalid command target or interaction type");
                }
            } else {
                // this isn't a context command
                throw new Error("TODO replace with real response");
            }
        } catch(e) {
            this.logger.error("Error while running command", e);
            const embed = makeErrorEmbed("Error running command", "Sorry, an error occurred while running this command. If the problem persists please contact the bot developer.");
            if(i.replied || i.deferred) await i.editReply({ embeds: [embed] });
            else await i.reply({ embeds: [embed] });
        }
    }
}
