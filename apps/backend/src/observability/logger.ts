import pino from "pino";

export function createLogger(level: string) {
  return pino({
    level,
    redact: ["secretKey", "KEYSTORE_MASTER_KEY"],
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
  });
}
