import { StyleFunction } from "ansi-colors";

export default class Console {
    
    constructor() {

    }

    /**
     * Prints the given data to the console.
     * @param data The data to print out
     * @param color The color/formatting to print the text out as
     */
    print(data: any, color?: StyleFunction) {
        if(color) {
            data = color(data as string);
        }
        process.stdout.write(data);
    }
    
    /**
     * Prints the given data to the console and appends a new line to the end.
     * Any subsequent prints will be on the next line down.
     * @param data The data to print out
     * @param color The color/formatting to print the text out as
     */
    println(data: any, color?: StyleFunction) {
        this.print(`${data}\n`, color);
    }



}