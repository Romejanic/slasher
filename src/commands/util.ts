import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { CommandContexts, InstallScope } from ".";

export function getInteractionContexts(contexts: Partial<CommandContexts>) {
    const types = new Array<InteractionContextType>();
    if(contexts.server) types.push(InteractionContextType.Guild);
    if(contexts.botDM) types.push(InteractionContextType.BotDM);
    if(contexts.otherDM) types.push(InteractionContextType.PrivateChannel);
    return types;
}

export function getIntegrationTypes(scope: Partial<InstallScope>) {
    const types = new Array<ApplicationIntegrationType>();
    if(scope.server) types.push(ApplicationIntegrationType.GuildInstall);
    if(scope.user) types.push(ApplicationIntegrationType.UserInstall);
    return types;
}
