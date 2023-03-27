// just export everything from both modules

export * from './src/api/wrapped-client';
export * from './src/api/command-context';

// add constants enum to comply with discord.js v14 conventions
export enum SlasherEvents {
    CommandCreate = "command"
}
