import PageViewModel from "./pageViewModel";

export default class ErrorViewModel extends PageViewModel {
    public error = {
        status: "",
        stack: ""
    }

    constructor(public message: string, status?: string, stack?: string) {
        super("Error");
        this.error.status = status ?? this.error.status;
        this.error.stack = stack ?? this.error.stack;
    }
}