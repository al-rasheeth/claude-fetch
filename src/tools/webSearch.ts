import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SearchService } from "../services/search.js";

export function registerWebSearchTool(
    server: McpServer,
    searchService: SearchService
) {
    server.registerTool(
        "web_search",
        {
            description:
                "Search the web using DuckDuckGo. Returns a list of search results with titles, URLs, and descriptions. Use this to find information or URLs to scrape.",
            inputSchema: z.object({
                query: z.string().describe("The search query"),
            }),
        },
        async ({ query }) => {
            try {
                const results = await searchService.search(query);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error searching web: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
