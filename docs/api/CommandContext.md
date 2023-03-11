# CommandContext
`CommandContext` is an object which is passed as a parameter to the [command](./SlasherClient.md#command) event of [SlasherClient](./SlasherClient.md). It provides useful context about the command currently being executed and the user who sent it. It also provides details about the current server when being used within one.

**Table of Contents**
1. [Import (types only)](#import-types-only)
2. [Properties](#properties)
3. [Methods](#methods)
    1. [.reply(content, ?hidden)](#replycontent-hidden)
    2. [.defer(?hidden)](#deferhidden)
    3. [.edit(content)](#editcontent)
    4. [.followUp(content, ?hidden)](#followupcontent-hidden)
    5. [.modalResponse(modal, ?timeout, ?options)](#modalresponsemodal-timeout-options)

## Import (types only)
TypeScript
```typescript
import { CommandContext } from 'discord.js-slasher';
```

## Properties
`?property` denotes an optional property.

|Name|Type|Optional|Description|
|----|----|--------|-----------|
|name|string|no|The name of the executed command|
|command|[Command](./Command.md)|no|The full command interaction object|
|options|[CommandInteractionOptionResolver](https://discord.js.org/#/docs/main/stable/class/CommandInteractionOptionResolver)|no|The options passed into the command by the user|
|isServer|boolean|no|Is the current message in a server text channel?|
|isDM|boolean|no|Is the current message in the user's direct message channel?|
|?channel|[TextBasedChannels](https://discord.js.org/#/docs/main/stable/typedef/TextBasedChannels)|yes|The channel which the command was run in|
|user|[User](https://discord.js.org/#/docs/main/stable/class/User)|no|The user who sent the command|
|?server|object (see below)|yes|Server specific values. This object will be undefined if `isServer` is false, so ensure you check that you're in a server before using this object.|
|client|[SlasherClient](./SlasherClient.md)|no|The bot's client object|

**Server properties**
|Name|Type         |Description|
|----|-------------|-----------|
|name|string|The name of the server|
|id  |string|The server's ID|
|guild|[Guild](https://discord.js.org/#/docs/main/stable/class/Guild)|The server's guild object, which allows access to all properties|
|member|[GuildMember](https://discord.js.org/#/docs/main/stable/class/GuildMember)|The user's member object, for accessing roles and permissions|
|owner|boolean|Whether the user is the owner of the server|
|isUserAdmin|boolean|Whether the user has the `ADMINISTRATOR` permission on this server|
|channelPermissions|[Permissions](https://discord.js.org/#/docs/main/stable/class/Permissions) (readonly)|The user's permissions in the channel which the message was sent in|



## Methods

### .reply(content, ?hidden)
Replies to the command interaction with a certain message. This will mark the interaction as complete, but it can still be edited later.

|Parameter|Type                                 |Description|Required|
|---------|-------------------------------------|-----------|------|
|content|string or [MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) or [InteractionReplyOptions](https://discord.js.org/#/docs/main/stable/typedef/InteractionReplyOptions)|What to reply to the message with.|yes|
|[hidden](./EphemeralResponses.md)|boolean|Whether this message will be visible only to the sender [(ephemeral repsonse)](https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses)|no (default `false`)|

**Returns:** `Promise<`[Message](https://discord.js.org/#/docs/main/stable/class/Message)` | void>`
A promise for the sent reply message

### .defer(?hidden)
Marks that the response to the message will be deferred (i.e. delayed until later). This will be useful if you need to perform some kind of calculation/fetching before a response can be shown. This should always be done **first** if you know you'll need to defer the response.

e.g.
```js
client.on("command", async (ctx) => {
    await ctx.defer(); // defer the response
    
    // perform calculations

    await ctx.reply("something"); // reply with something
});
```

In Discord, deferring the response will display `"<botname> is thinking..."` until a reply is sent.

|Parameter|Type                                 |Description|Required|
|---------|-------------------------------------|-----------|------|
|[hidden](./EphemeralResponses.md)|boolean|Whether this message will be visible only to the sender [(ephemeral repsonse)](https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses)|no (default `false`)|

**Returns:** `Promise<void>`
A promise which resolves once the response is sent


### .edit(content)
Edits the previous response to this interaction and overwrites it. The status of whether this response was hidden or not is determined by the previous response, it cannot be changed afterwards.

|Parameter|Type                                 |Description|Required|
|---------|-------------------------------------|-----------|------|
|content|string or [MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) or [WebhookEditMessageOptions](https://discord.js.org/#/docs/main/stable/typedef/WebhookEditMessageOptions)|The new message content to overwrite the previous message with.|yes|

**Returns:** `Promise<`[Message](https://discord.js.org/#/docs/main/stable/class/Message)` | void>`
A promise for the edited reply message

### .followUp(content, ?hidden)
Follows up the previous response with another one. Can be useful for sending a later response or giving an update to the user about the status of the previous request.

|Parameter|Type                                 |Description|Required|
|---------|-------------------------------------|-----------|------|
|content|string or [MessageEmbed](https://discord.js.org/#/docs/main/stable/class/MessageEmbed) or [InteractionReplyOptions](https://discord.js.org/#/docs/main/stable/typedef/InteractionReplyOptions)|What to follow up the message with.|yes|
|hidden|boolean|Whether this message will be visible only to the sender|no (default `false`)|

**Returns:** `Promise<`[Message](https://discord.js.org/#/docs/main/stable/class/Message)`>`
A promise for the sent follow up message

### .modalResponse(modal, ?timeout, ?options)
Shows the given modal to the user, and resolves once the user has submitted a response. If no response is given within either the timeout specified or a default of 10 minutes, an error is thrown. See [handling modals](../guides/handling-modals.md) for a full guide on how to use modals.

|Parameter|Type                                 |Description|Required|
|---------|-------------------------------------|-----------|------|
|modal|[Modal](https://discord.js.org/#/docs/discord.js/stable/class/Modal) or [ModalOptions](https://discord.js.org/#/docs/discord.js/stable/typedef/ModalOptions)|The modal to show to the user.|yes|
|timeout|number|The number of milliseconds to wait for a response before timing out.|no (default 10 minutes)|
|options|[AwaitModalSubmitOptions](https://discord.js.org/#/docs/discord.js/stable/typedef/AwaitModalSubmitOptions)|Other options to send to the internal modal await. Some properties such as filter and time are overwritten.|no (default `null`)|

**Returns:** `Promise<`[ModalSubmitInteraction](https://discord.js.org/#/docs/main/stable/class/ModalSubmitInteraction)`>`
A promise for the modal submit interaction, which contains the entered text.