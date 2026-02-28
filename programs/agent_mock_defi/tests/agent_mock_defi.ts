import * as anchor from "@coral-xyz/anchor";
import { strict as assert } from "node:assert";

describe("agent_mock_defi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("bootstraps", async () => {
    assert.ok(provider.connection);
  });
});
