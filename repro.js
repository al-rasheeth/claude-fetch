const { JSDOM } = require("jsdom");

async function testJSDOM() {
    console.log("Testing JSDOM instantiation...");
    try {
        const dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>", { url: "http://example.com" });
        console.log("✅ JSDOM instantiated:", dom.window.document.querySelector("p").textContent);
    } catch (e) {
        console.error("❌ JSDOM instantiation failed:", e);
    }
}

async function testScraper() {
    console.log("Testing SmartScraper...");
    try {
        // We need to require the compiled JS file
        const { SmartScraper } = require("./dist/services/scraper.js");
        const scraper = new SmartScraper();
        // Mock puppeteer launch if possible or just see if class loads
        console.log("✅ SmartScraper class loaded");

        // If we want to test scrape, we might need to mock puppeteer or run it
        // But the error is "es require error with jsdom", likely happening at require time or instantiation
    } catch (e) {
        console.error("❌ SmartScraper loading failed:", e);
    }
}

(async () => {
    await testJSDOM();
    await testScraper();
})();
