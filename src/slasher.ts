#!/usr/bin/env node
import * as colors from "ansi-colors";
import Console from "./console";

const console = new Console();

async function main() {
    console.println("SLASHER");
    console.println("Coloured test!", colors.red);
}

main();