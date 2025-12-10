import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerLocalFetchTool(server: McpServer) {
    server.registerTool(
        "local_fetch",
        {
            description:
                "Fetch a URL from the local machine using standard HTTP GET. Use this for static pages or APIs. Returns the raw text content.",
            inputSchema: z.object({
                url: z.string().url().describe("The URL to fetch"),
            }),
        },
        async ({ url }) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error: ${response.status} ${response.statusText}`,
                            },
                        ],
                        isError: true,
                    };
                }
                const text = await response.text();
                return {
                    content: [
                        {
                            type: "text",
                            text: text,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error fetching URL: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
