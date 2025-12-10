#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { SmartScraper } from "./services/scraper.js";
import { SearchService } from "./services/search.js";
import {
    registerLocalFetchTool,
    registerSmartScrapeTool,
    registerWebSearchTool,
} from "./tools/index.js";

// Create an MCP server
const server = new McpServer({
    name: "claude-fetch-local",
    version: "1.0.0",
});

const scraper = new SmartScraper(process.env.CHROME_EXECUTABLE_PATH);
const searchService = new SearchService();

// Register tools
registerLocalFetchTool(server);
registerSmartScrapeTool(server, scraper);
registerWebSearchTool(server, searchService);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // console.error("Claude Fetch Local MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

// Cleanup on exit
process.on("SIGINT", async () => {
    await scraper.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await scraper.close();
    process.exit(0);
});
