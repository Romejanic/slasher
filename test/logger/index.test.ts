import { beforeEach, describe, expect, setSystemTime, spyOn, test } from "bun:test";

describe("SlasherLogger", () => {

    const consoleDebugSpy = spyOn(console, "debug");
    const consoleLogSpy = spyOn(console, "log");
    const consoleWarnSpy = spyOn(console, "warn");
    const consoleErrorSpy = spyOn(console, "error");

    beforeEach(() => {
        setSystemTime(new Date("2025-08-04"));
        global.console = {
            ...global.console,
            debug: consoleDebugSpy,
            log: consoleLogSpy,
            warn: consoleWarnSpy,
            error: consoleErrorSpy
        };
        consoleDebugSpy.mockClear();
        consoleLogSpy.mockClear();
        consoleWarnSpy.mockClear();
        consoleErrorSpy.mockClear();
    });

    test("debug()", async () => {
        const SlasherLogger = await getModule();
        const logger = new SlasherLogger("debug");
        logger.debug("Debug Message");
        logger.info("Info Message");
        logger.warn("Warn Message");
        logger.error("Error Message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        expect(consoleDebugSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][debug]", "Debug Message");
        expect(consoleLogSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][info]", "Info Message");
        expect(consoleWarnSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][warn]", "Warn Message");
        expect(consoleErrorSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][error]", "Error Message");
    });

    test("info()", async () => {
        const SlasherLogger = await getModule();
        const logger = new SlasherLogger("info");
        logger.debug("Debug Message");
        logger.info("Info Message");
        logger.warn("Warn Message");
        logger.error("Error Message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        expect(consoleLogSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][info]", "Info Message");
        expect(consoleWarnSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][warn]", "Warn Message");
        expect(consoleErrorSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][error]", "Error Message");
    });

    test("warn()", async () => {
        const SlasherLogger = await getModule();
        const logger = new SlasherLogger("warn");
        logger.debug("Debug Message");
        logger.info("Info Message");
        logger.warn("Warn Message");
        logger.error("Error Message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
        expect(consoleLogSpy).toHaveBeenCalledTimes(0);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        expect(consoleWarnSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][warn]", "Warn Message");
        expect(consoleErrorSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][error]", "Error Message");
    });

    test("error()", async () => {
        const SlasherLogger = await getModule();
        const logger = new SlasherLogger("error");
        logger.debug("Debug Message");
        logger.info("Info Message");
        logger.warn("Warn Message");
        logger.error("Error Message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
        expect(consoleLogSpy).toHaveBeenCalledTimes(0);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        expect(consoleErrorSpy).toHaveBeenCalledWith("[2025-08-04T00:00:00.000Z][error]", "Error Message");
    });

    test("custom prefix", async () => {
        const SlasherLogger = await getModule();
        const logger = new SlasherLogger("debug", "<%level> -- <%ts> --");
        logger.debug("Debug Message");
        logger.info("Info Message");
        logger.warn("Warn Message");
        logger.error("Error Message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        expect(consoleDebugSpy).toHaveBeenCalledWith("<debug> -- <2025-08-04T00:00:00.000Z> --", "Debug Message");
        expect(consoleLogSpy).toHaveBeenCalledWith("<info> -- <2025-08-04T00:00:00.000Z> --", "Info Message");
        expect(consoleWarnSpy).toHaveBeenCalledWith("<warn> -- <2025-08-04T00:00:00.000Z> --", "Warn Message");
        expect(consoleErrorSpy).toHaveBeenCalledWith("<error> -- <2025-08-04T00:00:00.000Z> --", "Error Message");
    });

});

async function getModule() {
    return (await import("../../src/logger")).default;
}
