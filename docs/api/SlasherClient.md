# SlasherClient
`SlasherClient` is a subclass of the normal discord.js [Client](https://discord.js.org/#/docs/main/stable/class/Client) class, meaning most of its functionality is the same (events, activity status, etc). Most of the changes revolve around how you log in with your token and recieve the events for commands.

**Table of Contents**
1. [Import](#import)
2. [Constructor](#constructor)
2. [Methods](#methods)
    1. [.login()](#login)
3. [Events](#events)
    1. [CommandCreate](#commandcreate)

## Import
JavaScript (pre ES6)
```js
const { SlasherClient } = require("discord.js-slasher");
```

TypeScript
```typescript
import { SlasherClient } from 'discord.js-slasher';
```

## Constructor
Used to create the client object. In almost all cases, it should one of these two use cases:
```js
// passes the token in as a string
let client = new SlasherClient({ token: ... });
```
```js
// automatically reads the token from auth.json
let client = new SlasherClient();
```
However the options parameter extends discord.js' [ClientOptions](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions) interface, so any valid options for discord.js will also work (e.g. more intents, partials, sharding).

|Parameter|Type                                 |Description|
|---------|-------------------------------------|-----------|
|options  |[SlasherClientOptions](./SlasherClientOptions.md)|The options used to create the client object|

## Methods

### .login()
Logs into Discord with the provided token in the constructor. This replaces discord.js' implementation which requires the token to be passed into this function. __You do not need to pass the token__ to this function.

**Returns:** `Promise<string>`
A promise for the token of the bot

Also see: [Inherited methods from Client](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=destroy)

## Events
For a complete list of events see [SlasherEvents](./SlasherEvents.md).

### [CommandCreate](./SlasherEvents.md#commandcreate)
Emitted when a slash command is executed by a user using the bot. Passes a context object which provides most of the data needed to interact with the command and designed to simplify most checks and operations.

|Parameter|Type                                 |Description|
|---------|-------------------------------------|-----------|
|context  |[CommandContext](./CommandContext.md)|The context object for the executed command|

Also see: [Inherited events from Client](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-apiRequest)