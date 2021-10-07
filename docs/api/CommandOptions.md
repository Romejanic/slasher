# CommandOptions
`CommandOptions` is an extension for discord.js' built in [CommandInteractionOptionResolver](https://discord.js.org/#/docs/main/stable/class/CommandInteractionOptionResolver) class, with some added methods to improve the user experience of getting options.

Most of the properties and methods are shared with the parent class, and you should visit the pape above for a full list.

**Table of Contents**
1. [Import (types only)](#import-types-only)
2. [Properties](#properties)
3. [Methods](#methods)
    1. [.has(option)](#hasoption)

## Import (types only)
```typescript
import { CommandOptions } from 'discord.js-slasher';
```

## Properties
This class does not have its own properties. Please [see here](https://discord.js.org/#/docs/main/stable/class/CommandInteractionOptionResolver) for a list of inherited properties.


## Methods

### .has(option)
Determines if a given option has been set by the user. This can be used to cleanly check if an option exists, and act accordingly depending on the state.

e.g.
```js
client.on("command", async (ctx) => {
    // greet the name if it exists
    if(ctx.options.has("name")) {
        await ctx.reply("Hello " + ctx.options.getString("name"));
    } else {
        await ctx.reply("Hello everyone!");
    }
});
```

|Parameter|Type|Description|Required|
|---------|----|-----------|------|
|option|string|The name of the option to check|yes|

**Returns:** `boolean`
*true* if the option is set, *false* otherwise

Also see: [Inherited methods from CommandInteractionOptionResolver](https://discord.js.org/#/docs/main/stable/class/CommandInteractionOptionResolver?scrollTo=get)