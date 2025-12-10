# Claude Fetch Local

A local MCP server that provides tools to fetch and scrape web pages, designed to bypass corporate proxy restrictions and optimize for token efficiency by converting content to Markdown.

## Features

- **Local Execution**: Runs on your machine, bypassing cloud proxies.
- **Smart Scraping**: Uses Puppeteer to handle dynamic JavaScript-heavy sites.
- **Token Efficient**: Converts HTML to clean Markdown using Mozilla Readability and Turndown.
- **Standard Fetch**: Includes a simple `fetch` tool for static pages.

## Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build**:
    ```bash
    npm run build
    ```

## Configuration

### Claude Desktop

Add the following to your `claude_desktop_config.json` (usually located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "claude-fetch": {
      "command": "node",
      "args": [
        "/Users/rasheeth/Documents/anti-gravity/claude-fetch/dist/index.js"
      ],
      "env": {
        "CHROME_EXECUTABLE_PATH": "/path/to/your/chrome" 
      }
    }
  }
}
```

### Corporate Environment Setup (Skip Download)

If you cannot download the browser via Puppeteer:

1.  **Install with skip download**:
    ```bash
    PUPPETEER_SKIP_DOWNLOAD=true npm install
    ```
2.  **Configure Path**:
    Set the `CHROME_EXECUTABLE_PATH` environment variable in your MCP configuration (as shown above) to point to your system's Chrome or Edge installation.
    - **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
    - **Windows**: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`

### Claude Code

To use with Claude Code, you can run it as an MCP server. (Consult Claude Code documentation for specific MCP integration steps if different from Desktop).

## Usage

Once configured, you can ask Claude:

- "Scrape https://example.com"
- "Fetch the content of https://example.com"
- "Summarize the article at https://news.ycombinator.com"

The server provides two tools:
- `local_fetch`: For simple, static content.
- `smart_scrape`: For complex, dynamic content (renders JS, extracts main article, converts to Markdown).
