import { EmbedBuilder, userMention } from "discord.js";
import type SlasherSubcommandGroups from "../../../src/commands/types/SlasherSubcommandGroups";

const subcommandGroupTest: SlasherSubcommandGroups = {

    name: "subcmd-group",
    description: "Test for subcommand groups",

    groups: {
        user: {
            description: "Commands targeting user",
            subcommands: {
                get: {
                    description: "Gets the info of the requesting user",
                    options: {
                        user: {
                            type: "user",
                            description: "User to target"
                        }
                    },
                    async execute(ctx) {
                        const user = ctx.options.getUser("user") ?? ctx.user;
                        await ctx.reply({
                            embeds: [new EmbedBuilder({
                                title: user.displayName,
                                description: userMention(user.id)
                            })]
                        });
                    },
                },
                list: {
                    description: "Lists all users",
                    async execute(ctx) {
                        const users = ctx.guild!.members.cache;
                        const embed = new EmbedBuilder().setTitle("User list");
                        for(const [_,user] of users) {
                            embed.addFields([{ name: user.displayName, value: userMention(user.id) }]);
                        }
                        await ctx.reply({
                            embeds: [embed]
                        });
                    },
                }
            }
        },
        role: {
            description: "Commands targeting role",
            subcommands: {
                get: {
                    description: "Gets the info of your roles",
                    async execute(ctx) {
                        const roles = ctx.guild!.members.resolve(ctx.user)!.roles;
                        const embed = new EmbedBuilder().setTitle(`${ctx.user.displayName}'s Roles`);
                        for(const [_,role] of roles.cache) {
                            embed.addFields([{ name: role.name, value: String(role.position), inline: true }]);
                        }
                        await ctx.reply({
                            embeds: [embed]
                        });
                    },
                },
                list: {
                    description: "Lists the server's roles",
                    async execute(ctx) {
                        const roles = ctx.guild!.roles;
                        const embed = new EmbedBuilder().setTitle(`Server Roles`);
                        for(const [_,role] of roles.cache) {
                            embed.addFields([{ name: role.name, value: String(role.position), inline: true }]);
                        }
                        await ctx.reply({
                            embeds: [embed]
                        });
                    },
                }
            }
        }
    }

};

export default subcommandGroupTest;
