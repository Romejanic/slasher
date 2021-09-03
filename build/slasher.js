#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("S/ASHER " + require("../package.json").version + " by Romejanic");
    console.log();
    // check the command definition exists
    if (!fs.existsSync("commands.json")) {
        console.error("!! ERROR !!");
        console.error("You do not have a command file in your project!");
        console.error("Please create a commands.json file in the base of your project.");
        return;
    }
}))();
