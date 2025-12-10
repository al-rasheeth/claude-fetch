import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SmartScraper } from "../services/scraper.js";

export function registerSmartScrapeTool(
    server: McpServer,
    scraper: SmartScraper
) {
    server.registerTool(
        "smart_scrape",
        {
            description:
                "Scrape a URL using a headless browser and convert to Markdown. Use this for dynamic websites, articles, or when you need clean text content without HTML clutter.",
            inputSchema: z.object({
                url: z.string().url().describe("The URL to scrape"),
                screenshot: z.boolean().optional().describe("Take a screenshot of the page"),
                mobile: z.boolean().optional().describe("Emulate a mobile device"),
            }),
        },
        async ({ url, screenshot, mobile }) => {
            try {
                const result = await scraper.scrape(url, { screenshot, mobile });

                const content: any[] = [
                    {
                        type: "text",
                        text: `Title: ${result.title}\n\n${result.content}`,
                    },
                ];

                if (result.screenshot) {
                    content.push({
                        type: "image",
                        data: result.screenshot,
                        mimeType: "image/png",
                    });
                }

                return {
                    content,
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error scraping URL: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );
}
