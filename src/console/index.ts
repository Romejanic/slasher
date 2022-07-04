import { StyleFunction } from "ansi-colors";
import ObfuscatedWriteable from "./ObfuscatedWriteable";

export default class Console {
    
    private output: ObfuscatedWriteable;

    constructor() {
        this.output = new ObfuscatedWriteable(process.stdout);
    }

    /**
     * Prints the given data to the console.
     * @param data The data to print out
     * @param color The color/formatting to print the text out as
     */
    print(data: any, color?: StyleFunction): Promise<void> {
        if(color) {
            data = color(data as string);
        }
        return new Promise((resolve, reject) => {
            this.output.write(Buffer.from(data, "utf8"), (e) => {
                if(e) reject(e);
                else resolve();
            });
        });
    }
    
    /**
     * Prints the given data to the console and appends a new line to the end.
     * Any subsequent prints will be on the next line down.
     * @param data The data to print out
     * @param color The color/formatting to print the text out as
     */
    println(data: any, color?: StyleFunction): Promise<void> {
        return this.print(`${data}\n`, color);
    }

    /**
     * Allows input to hidden to avoid printing sensitive data (e.g. bot tokens).
     * @param hidden Whether the input should be hidden or not.
     */
    setInputHidden(hidden: boolean) {
        this.output.setObfuscated(hidden);
    }

}