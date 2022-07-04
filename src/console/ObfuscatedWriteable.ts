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
                // replace all chars with "*"
                let txt = Array(chunk).map(_ => "*").join("");
                this.parent.write(txt, "ascii", callback);
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