#!/usr/bin/env node

import * as fs from 'fs';
import * as colors from 'ansi-colors';

(async () => {
    console.log("S/ASHER " + require("../package.json").version + " by Romejanic");
    console.log();

    // check the command definition exists
    if(!fs.existsSync("commands.json")) {
        console.error(colors.red("!! ERROR !!"));
        console.error(colors.red("You do not have a command file in your project!"));
        console.error(colors.red("Please create a " + colors.bold.red("commands.json") + " file in the base of your project."));
        return;
    }

})();