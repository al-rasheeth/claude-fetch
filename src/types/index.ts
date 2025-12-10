export interface ScrapeResult {
    title: string;
    content: string;
    byline: string;
    excerpt: string;
    url: string;
    screenshot?: string; // Base64 encoded image
    links?: string[];
    metadata?: Record<string, string>;
}
