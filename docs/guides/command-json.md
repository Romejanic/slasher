# command.json format

**Table of Contents**


## Schema
For all `commands.json` files, you should include a `$schema` property to provide auto-complete and suggestions for your file, which will greatly improve your productivity and reduce your proneness to errors.

```json
{
    "$schema": "https://raw.githubusercontent.com/Romejanic/slasher/master/schema.json"
}
```

The examples in this file will not include the `$schema` property, but you should keep in mind that it should always be present above your command definitions.

## Basic Commands
Adding a basic command is dead simple. All you need is to provide a description for the command.
```json
{
    "command": {
        "description": "A brief, concise description of the command"
    }
}
```

This will result in a command like `/command`, with no additional arguments.

## Commands with options
Commands can also have options