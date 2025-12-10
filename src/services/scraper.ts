import puppeteer, { Browser, Page } from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { ScrapeResult } from "../types/index.js";

export class SmartScraper {
    private browser: Browser | null = null;
    private executablePath: string | undefined;

    constructor(executablePath?: string) {
        this.executablePath = executablePath;
    }

    private async getBrowser(): Promise<Browser> {
        if (!this.browser || !this.browser.connected) {
            this.browser = await puppeteer.launch({
                headless: true, // Use new headless mode
                executablePath: this.executablePath,
                // Best practice: Don't disable sandbox unless necessary (e.g. inside Docker)
                // args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        }
        return this.browser;
    }

    async scrape(url: string, options?: { mobile?: boolean; screenshot?: boolean; includeLinks?: boolean; includeMetadata?: boolean }): Promise<ScrapeResult> {
        const browser = await this.getBrowser();
        const page = await browser.newPage();

        try {
            // Mobile Emulation
            if (options?.mobile) {
                await page.setUserAgent(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                );
                await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
            } else {
                // Set a generic desktop user agent
                await page.setExtraHTTPHeaders({
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                });
                await page.setViewport({ width: 1280, height: 800 });
            }

            // Optimize: Block images, fonts, and stylesheets to save bandwidth and speed up loading
            // Note: If taking a screenshot, we might WANT images.
            // For now, we'll keep blocking them for speed unless the user specifically asks for a screenshot?
            // Actually, if screenshot is requested, we probably want the page to look right.
            // Let's unblock images if screenshot is true.
            await page.setRequestInterception(true);
            page.on("request", (req) => {
                const resourceType = req.resourceType();
                if (
                    (resourceType === "image" && !options?.screenshot) || // Only block images if NOT taking a screenshot
                    resourceType === "font" ||
                    resourceType === "media"
                ) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Navigate to the URL
            // networkidle2 is often better for modern sites (waits for < 2 network connections)
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

            // Get the HTML content
            const html = await page.content();

            // Parse with JSDOM and Readability
            const doc = new JSDOM(html, { url });
            const reader = new Readability(doc.window.document);
            const article = reader.parse();

            if (!article) {
                throw new Error("Failed to parse article content");
            }

            // Convert to Markdown
            const turndownService = new TurndownService({
                headingStyle: "atx",
                codeBlockStyle: "fenced",
            });
            const markdown = turndownService.turndown(article.content || "");

            // Take Screenshot if requested
            let screenshot: string | undefined;
            if (options?.screenshot) {
                const buffer = await page.screenshot({ encoding: "base64", fullPage: false });
                screenshot = buffer;
            }

            // Extract Links
            let links: string[] | undefined;
            if (options?.includeLinks) {
                links = await page.$$eval("a", (anchors) =>
                    anchors
                        .map((a) => a.href)
                        .filter((href) => href.startsWith("http")) // Only keep valid http/https links
                        .filter((value, index, self) => self.indexOf(value) === index) // Deduplicate
                );
            }

            // Extract Metadata (OpenGraph + standard)
            let metadata: Record<string, string> | undefined;
            if (options?.includeMetadata) {
                metadata = await page.evaluate(() => {
                    const meta: Record<string, string> = {};
                    const metaTags = document.querySelectorAll("meta");
                    metaTags.forEach((tag) => {
                        const name = tag.getAttribute("name") || tag.getAttribute("property");
                        const content = tag.getAttribute("content");
                        if (name && content) {
                            meta[name] = content;
                        }
                    });
                    return meta;
                });
            }

            return {
                title: article.title || "",
                content: markdown,
                byline: article.byline || "",
                excerpt: article.excerpt || "",
                url: url,
                screenshot,
                links,
                metadata,
            };
        } finally {
            await page.close();
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
