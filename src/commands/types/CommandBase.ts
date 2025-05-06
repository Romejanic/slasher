import { CommandContexts, CommandPermissions, InstallScope } from "./SlasherCommand";

/** Base command type with shared properties across all commands. Don't use this directly. */
export default interface CommandBase<B> {

    /** The name of the command as it appears in Discord. */
    name: string;

    /** The default permissions applied to your command. This can be overridden by server owners. */
    defaultPermissions?: CommandPermissions;

    /** The contexts in which the command can be used. */
    contexts?: Partial<CommandContexts>;

    /** Where this command can be installed (guild or user). */
    installScope?: Partial<InstallScope>;

    /** Hook to access the underlying builder during the sync process. */
    builderHook?: (builder: B) => void;

}
