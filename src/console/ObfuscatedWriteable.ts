import { Writable } from "stream";

/**
 * A custom Writable stream which can obfuscate text if necessary.
 * Takes a parent Writeable which text is redirected to.
 */
export default class ObfuscatedWriteable extends Writable {

    private parent: Writable;
    private obfuscated: boolean;

    constructor(parent: Writable) {
        super({
            write: (chunk, encoding, callback) => {
                if(!this.obfuscated) {
                    return this.parent.write(chunk, encoding, callback);
                }

                const ignored = ["\n", "\t", "\b"];

                // replace all chars with "*"
                let buf: string = Buffer.from(chunk, encoding).toString();
                let txt: string = buf.split("").map(c => ignored.includes(c) ? c : "*").join("");
                return this.parent.write(Buffer.from(txt), "ascii", callback);
            }
        });
        this.parent = parent;
    }

    /**
     * Gets whether this writable is current obfuscated (i.e. hides text output).
     * @returns true if output is obfuscated, false otherwise
     */
    isObfuscated() {
        return this.obfuscated;
    }

    /**
     * Sets whether this writable should be obfuscating text.
     * @param obfuscated whether to obfuscate the text or not
     */
    setObfuscated(obfuscated: boolean) {
        this.obfuscated = obfuscated;
    }

}