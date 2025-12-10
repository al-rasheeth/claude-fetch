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

## CLAUDE.md Configuration

To ensure Claude uses these local tools instead of its built-in capabilities (which might be blocked), add the following to your project's `CLAUDE.md` or system instructions:

```markdown
# Tool Preferences
Always use the following local MCP tools for web interactions to bypass network restrictions:

1.  **`web_search`**: Use this for finding information, documentation, or URLs.
2.  **`local_fetch`**: Use this for fetching static content from known URLs. It is fast and efficient.
3.  **`smart_scrape`**: Use this for:
    - Dynamic websites (SPA, JavaScript-heavy).
    - When you need to extract links (`includeLinks: true`).
    - When you need metadata (`includeMetadata: true`).
    - When you need a screenshot (`screenshot: true`).
    - When you need mobile emulation (`mobile: true`).

**DO NOT** use the built-in `fetch` or `search` tools if they are blocked by the network.
```

## License

MIT

## Usage

Once configured, you can ask Claude:

- "Scrape https://example.com"
- "Fetch the content of https://example.com"
- "Summarize the article at https://news.ycombinator.com"

The server provides two tools:
- `local_fetch`: For simple, static content.
- `smart_scrape`: For complex, dynamic content (renders JS, extracts main article, converts to Markdown).
