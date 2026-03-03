import type { FastifyBaseLogger } from "fastify";
import type { AppConfig } from "../config.js";
import type { Notifier } from "./notifier.js";

class TelegramNotifier implements Notifier {
  constructor(
    private readonly token: string,
    private readonly chatId: string
  ) {}

  async send(message: string): Promise<void> {
    const endpoint = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
        disable_web_page_preview: true
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Telegram send failed: ${res.status} ${text}`);
    }
  }
}

export function createTelegramNotifier(config: AppConfig, logger: FastifyBaseLogger): Notifier | null {
  if (!config.TELEGRAM_NOTIFICATIONS_ENABLED) {
    return null;
  }
  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    logger.warn("Telegram notifications enabled but TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing.");
    return null;
  }
  return new TelegramNotifier(config.TELEGRAM_BOT_TOKEN, config.TELEGRAM_CHAT_ID);
}
