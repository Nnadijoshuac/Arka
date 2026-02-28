import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AgentRunner } from "../agents/agentRunner.js";

const createAgentsSchema = z.object({
  count: z.number().int().positive().max(50).default(1)
});

export async function registerAgentRoutes(app: FastifyInstance, runner: AgentRunner) {
  app.get("/agents", async () => ({ agents: runner.listAgents() }));

  app.post("/agents", async (req) => {
    const parsed = createAgentsSchema.parse(req.body ?? {});
    const agents = await runner.createAgents(parsed.count);
    return { agents };
  });
}
