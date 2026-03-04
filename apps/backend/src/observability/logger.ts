import { createLogger as createStructuredLogger } from "../logger.js";

export function createLogger(level: string) {
  return createStructuredLogger(level, "backend");
}
