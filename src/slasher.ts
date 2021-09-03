#!/usr/bin/env node

import * as fs from 'fs';

(async () => {
    console.log("S/ASHER " + require("../package.json").version + " by Romejanic");
    console.log();

    // check the command definition exists
    if(!fs.existsSync("commands.json")) {
        console.error("!! ERROR !!");
        console.error("You do not have a command file in your project!");
        console.error("Please create a commands.json file in the base of your project.");
        return;
    }


})();