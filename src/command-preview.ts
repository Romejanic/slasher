export default class CommandPreview {

    stack: string[] = []

    push(str: string) {
        this.stack.push(str);
    }

    pop() {
        this.stack.pop();
    }

    get() {
        return this.stack.join(" ");
    }

}