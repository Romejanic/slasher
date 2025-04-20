// define log levels
const logLevels = ["debug", "info", "warn", "error"] as const;
export type LogLevel = typeof logLevels[number];

// map log levels to console functions
const logLevelMap: Record<LogLevel, typeof console["log"]> = {
    debug: console.debug,
    info: console.log,
    warn: console.warn,
    error: console.error
};

// default log format
const DEFAULT_PREFIX = "[%ts][%level]";

export default class SlasherLogger {

    private readonly level: LogLevel;
    private readonly levelIdx: number;
    private readonly prefix: string;

    constructor(level: LogLevel, prefix?: string) {
        this.level = level;
        this.levelIdx = logLevels.indexOf(level);
        this.prefix = prefix || DEFAULT_PREFIX;
    }

    private log(level: LogLevel, ...data: unknown[]) {
        if(logLevels.indexOf(level) < this.levelIdx) return;
        if(level in logLevelMap) {
            const prefix = this.prefix
                .replace("%ts", new Date().toISOString())
                .replace("%level", level);
            logLevelMap[level](prefix, ...data);
        }
    }

    public debug(...data: unknown[]) { this.log("debug", ...data); }
    public info(...data: unknown[]) { this.log("info", ...data); }
    public warn(...data: unknown[]) { this.log("warn", ...data); }
    public error(...data: unknown[]) { this.log("error", ...data); }

}
