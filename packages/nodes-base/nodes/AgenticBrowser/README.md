# Agentic Browser Node

A powerful browser automation node for n8n that provides programmatic control over web browsers with built-in support for LLM chat interfaces like ChatGPT, Claude, and Gemini.

## Features

- **Session Management**: Create, manage, and persist browser sessions with cookies and local storage
- **Navigation**: Navigate URLs, wait for selectors, and handle dynamic content
- **Interaction**: Click, type, and interact with page elements
- **Extraction**: Extract text, HTML, and take screenshots
- **Script Execution**: Run custom JavaScript code in the browser context
- **LLM Chat Support**: Built-in support for ChatGPT, Claude, Gemini with automatic message sending and response extraction
- **Stealth Mode**: Includes anti-bot detection measures
- **Session Persistence**: Store session data for maintaining logged-in states

## Resources and Operations

### Session

- **Create**: Launch a new browser session
  - Configure headless mode, window size, user agent, proxy
  - Set user data directory for session persistence
- **Get**: Retrieve session information including cookies and local storage
- **Close**: Terminate a browser session
- **List**: View all active browser sessions

### Navigation

- **Go To URL**: Navigate to a specific URL
  - Configure wait conditions (load, domcontentloaded, networkidle)
- **Wait For Selector**: Wait for an element to appear on the page

### Interaction

- **Click**: Click on elements using CSS selectors
- **Type**: Type text into input fields with optional clear-first

### Extraction

- **Get Text**: Extract text content from elements or full page
- **Screenshot**: Capture screenshots (PNG/JPEG, full page or viewport)

### Script

- **Execute**: Run custom JavaScript code in the browser context
  - Pass arguments as JSON
  - Return data from the page

### Chat

- **Send Message**: Send messages to LLM chat interfaces
  - Built-in support for ChatGPT, Claude, Gemini
  - Custom provider support with configurable selectors
  - Automatic response extraction
  - Wait for streaming completion

## Usage Examples

### Example 1: ChatGPT Automation

```
1. Session -> Create
   - Headless: false (to login manually first time)
   - User Data Dir: /path/to/profile (to persist login)

2. Navigation -> Go To URL
   - Session ID: {{$json.sessionId}}
   - URL: https://chat.openai.com

3. Chat -> Send Message
   - Session ID: {{$json.sessionId}}
   - Provider: ChatGPT
   - Message: Explain quantum computing in simple terms
   - Wait For Response: true

4. Extraction -> Get Text (optional, for additional extraction)
   - Session ID: {{$json.sessionId}}
   - Selector: [data-message-author-role="assistant"]
```

### Example 2: Web Scraping with Login

```
1. Session -> Create
   - User Data Dir: /tmp/browser-profile

2. Navigation -> Go To URL
   - URL: https://example.com/login

3. Interaction -> Type
   - Selector: input[name="username"]
   - Text: myusername

4. Interaction -> Type
   - Selector: input[name="password"]
   - Text: mypassword

5. Interaction -> Click
   - Selector: button[type="submit"]

6. Navigation -> Wait For Selector
   - Selector: .dashboard

7. Extraction -> Get Text
   - Selector: .user-data

8. Session -> Close
   - Session ID: {{$json.sessionId}}
```

### Example 3: Custom Script Execution

```
1. Session -> Create

2. Navigation -> Go To URL
   - URL: https://example.com

3. Script -> Execute
   - Script:
     ```javascript
     const title = document.title;
     const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
     return { title, linkCount: links.length, links };
     ```

4. Session -> Close
```

## Session Persistence

To maintain logged-in sessions across workflow executions:

1. Set a `User Data Directory` when creating a session
2. Log in manually (with headless: false) the first time
3. Subsequent executions will reuse the saved cookies and session data

Example:
```
User Data Dir: /home/user/.n8n/browser-profiles/chatgpt
```

## Custom LLM Provider

For LLM chat interfaces not included in the presets:

1. Select Provider: Custom
2. Configure selectors:
   - Input Selector: CSS selector for message input
   - Submit Selector: CSS selector for send button
   - Response Selector: CSS selector for response text
   - Streaming Indicator Selector: Element that appears while streaming

## Notes

- Sessions persist in memory until explicitly closed or the workflow is stopped
- Use session IDs to maintain browser state across multiple nodes
- For headless mode in production, ensure your system has required dependencies
- The stealth plugin helps avoid bot detection but is not foolproof
- Consider timeout values for slow-loading pages or long LLM responses

## Error Handling

The node supports "Continue On Fail" mode. Errors will be returned in the output JSON:

```json
{
  "error": "Error message here"
}
```

## Security Considerations

- User data directories may contain sensitive session data (cookies, tokens)
- Secure storage locations appropriately
- Be cautious with credentials in workflows
- Consider using n8n credentials system for sensitive data
