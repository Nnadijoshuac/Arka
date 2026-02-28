import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AgentRunner } from "../agents/agentRunner.js";

const runSchema = z.object({
  intervalMs: z.number().int().min(1000).max(10000).default(3000)
});

export async function registerDemoRoutes(app: FastifyInstance, runner: AgentRunner) {
  app.post("/demo/setup", async () => {
    return {
      ok: true,
      note: "Setup placeholder: extend to deploy mints and initialize pool on devnet."
    };
  });

  app.post("/demo/run", async (req) => {
    const parsed = runSchema.parse(req.body ?? {});
    runner.start(parsed.intervalMs);
    return { ok: true };
  });

  app.post("/demo/stop", async () => {
    runner.stop();
    return { ok: true };
  });
}
