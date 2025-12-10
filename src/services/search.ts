import { search, SafeSearchType } from "duck-duck-scrape";

export interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export class SearchService {
    async search(query: string): Promise<SearchResult[]> {
        try {
            const results = await search(query, {
                safeSearch: SafeSearchType.STRICT,
            });

            return results.results.map((result) => ({
                title: result.title,
                url: result.url,
                description: result.description,
            }));
        } catch (error) {
            console.error("Search failed:", error);
            throw error;
        }
    }
}
