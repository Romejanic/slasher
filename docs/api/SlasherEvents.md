# SlasherEvents
`SlasherEvents` is a enum which provides predefined constants for the predefined events which can be fired or listened to on [SlasherClient](./SlasherClient.md) instances. It currently only contains one event, but more may be added in future when necessary.

**Table of Contents**
1. [Import](#import)
2. [Enum Values](#enum-values)
    1. [.CommandCreate](#commandcreate)

## Import
JavaScript (pre ES6)
```js
const { SlasherEvents } = require("discord.js-slasher");
```

TypeScript
```typescript
import { SlasherEvents } from 'discord.js-slasher';
```

## Enum Values

### .CommandCreate
Fired when a user sends a command to the bot. This is called in tandem with the [Events.InteractionCreate](https://discord.js.org/#/docs/discord.js/main/typedef/Events) event in vanilla discord.js, but it adds the [CommandContext](./CommandContext.md) utility object. For an example on how to use this event, see [Getting Started](../guides/getting-started.md).

**Value**
`"command"`
