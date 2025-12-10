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
                includeLinks: z.boolean().optional().describe("Extract all links from the page"),
                includeMetadata: z.boolean().optional().describe("Extract metadata (OpenGraph, etc.)"),
            }),
        },
        async ({ url, screenshot, mobile, includeLinks, includeMetadata }) => {
            try {
                const result = await scraper.scrape(url, { screenshot, mobile, includeLinks, includeMetadata });

                let text = `Title: ${result.title}\n\n${result.content}`;

                if (result.metadata) {
                    text += `\n\n--- Metadata ---\n${JSON.stringify(result.metadata, null, 2)}`;
                }

                if (result.links && result.links.length > 0) {
                    text += `\n\n--- Links (${result.links.length}) ---\n${result.links.join("\n")}`;
                }

                const content: any[] = [
                    {
                        type: "text",
                        text: text,
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
