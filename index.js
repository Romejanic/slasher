import wc from './build/api/wrapped-client';
import cc from './build/api/command-context';

// export all types
module.exports = {
    SlasherClient: wc.SlasherClient,
    SlasherClientOptions: wc.SlasherClientOptions,
    Command: cc.Command,
    CommandContext: cc.CommandContext
};