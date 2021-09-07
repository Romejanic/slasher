# SlasherClientOptions
`SlasherClientOptions` is a basic interface which is passed into the constructor of the [SlasherClient](./SlasherClient.md) class. It is an extension of the [ClientOptions](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions) interface in discord.js, so most normal discord.js options will also work.

**Table of Contents**
1. [Import (types only)](#import-types-only)
2. [Properties](#properties)
    1. [?token](#token)
    2. [?useAuth](#useauth)

## Import (types only)
TypeScript
```typescript
import { SlasherClientOptions } from 'discord.js-slasher';
```

## Properties
`?property` denotes an optional property.

### ?token
The token for the bot. This is obtained from the 'Bot' section of your bot application's page on [discord.com/developers](https://discord.com/developers).

**Type**
string

**Required** no


### ?useAuth
When this property is set to true, the client will read the bot token from the `auth.json` file in the root directory of your project. This file will be automatically created by the `slasher` CLI tool when uploading your commands to Discord if you choose.

**Type**
boolean

**Required** no

Also see: [Inherited properties from ClientOptions](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions)