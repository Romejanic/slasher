#!/usr/bin/env node
import * as colors from "ansi-colors";
import Console from "./console";

const console = new Console();

async function main() {
    await console.println("SLASHER");
    await console.println("Coloured test!", colors.red);

    console.setInputHidden(true);
    await console.println("Hidden text output");
}

main();