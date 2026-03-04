import pino from "pino";

export function createLogger(level: string, module: string) {
  return pino({
    level,
    redact: ["secretKey", "KEYSTORE_MASTER_KEY", "KMS_MASTER_KEY_BASE64"],
    base: { module },
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: "message"
  });
}
