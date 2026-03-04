type EventPoint = { ts: number; ok: boolean };

export class CircuitBreaker {
  private readonly events: EventPoint[] = [];
  private open = false;

  constructor(
    private readonly threshold = 0.4,
    private readonly windowMs = 60_000,
    private readonly minSamples = 10
  ) {}

  isOpen(): boolean {
    return this.open;
  }

  record(ok: boolean): boolean {
    const now = Date.now();
    this.events.push({ ts: now, ok });
    this.compact(now);

    const total = this.events.length;
    if (total < this.minSamples) {
      return false;
    }

    const failures = this.events.filter((item) => !item.ok).length;
    const rate = failures / total;

    if (!this.open && rate > this.threshold) {
      this.open = true;
      return true;
    }

    return false;
  }

  reset(): void {
    this.open = false;
    this.events.length = 0;
  }

  private compact(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.events.length > 0 && this.events[0].ts < cutoff) {
      this.events.shift();
    }
  }
}
