#!/usr/bin/env node
import { StitchProxy } from "@google/stitch-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const apiKey = process.env.STITCH_API_KEY;
if (!apiKey) {
  console.error("Missing STITCH_API_KEY environment variable.");
  process.exit(1);
}

async function main() {
  const proxy = new StitchProxy({ apiKey });
  const transport = new StdioServerTransport();
  await proxy.start(transport);
}

main().catch((err) => {
  console.error("Stitch MCP Proxy Error:", err);
  process.exit(1);
});
