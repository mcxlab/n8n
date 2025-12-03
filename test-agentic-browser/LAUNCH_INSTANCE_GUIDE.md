# 🚀 Agentic Browser Test Instance - Launch Guide

This guide shows you how to launch and test the Agentic Browser node.

---

## 📦 What Was Generated

The test instance launcher created the following files:

1. **`/tmp/agentic-browser-test-workflow.json`**
   - Ready-to-import n8n workflow
   - 5 nodes demonstrating all capabilities
   - Pre-configured for Perplexity AI testing

2. **`/tmp/docker-compose-agentic-browser.yml`**
   - Complete Docker setup
   - Browserless server + n8n
   - One command to launch everything

3. **`/tmp/test-agentic-browser-setup.sh`**
   - Automated setup verification
   - Checks all connections
   - Validates configuration

---

## 🎯 Test Workflow Overview

The generated workflow demonstrates **5 key operations**:

### 1️⃣ Session Creation
```javascript
{
  resource: "session",
  operation: "create",
  parameters: {
    headless: true,
    connectionType: "local",
    fingerprintRandomize: true,
    humanBehaviorEnabled: true
  }
}
```
**Output**: `{ sessionId: "uuid-here" }`

### 2️⃣ Navigate to Perplexity
```javascript
{
  resource: "navigation",
  operation: "goto",
  parameters: {
    sessionId: "{{$json.sessionId}}",
    url: "https://www.perplexity.ai/",
    waitUntil: "networkidle2"
  }
}
```
**Output**: `{ url: "...", status: 200 }`

### 3️⃣ Send Chat Message (Human-Like)
```javascript
{
  resource: "chat",
  operation: "sendMessage",
  parameters: {
    provider: "custom",
    message: "What is quantum computing?",
    inputSelector: "textarea",
    submitSelector: "button[aria-label='Submit']",
    humanBehaviorEnabled: true,
    typingDelayMin: 50,    // Random 50-150ms per character
    typingDelayMax: 150,
    waitForResponse: true
  }
}
```
**Output**: `{ message: "...", response: "..." }`

### 4️⃣ Extract Response
```javascript
{
  resource: "extraction",
  operation: "getText",
  parameters: {
    selector: ".prose",
    multiple: false
  }
}
```
**Output**: `{ text: "AI response here..." }`

### 5️⃣ Take Screenshot
```javascript
{
  resource: "extraction",
  operation: "screenshot",
  parameters: {
    fullPage: false,
    type: "png"
  }
}
```
**Output**: Binary screenshot data

---

## 🐳 Option 1: Docker Launch (Recommended)

### Quick Start:
```bash
# 1. Navigate to tmp directory
cd /tmp

# 2. Launch everything
docker-compose -f docker-compose-agentic-browser.yml up -d

# 3. Wait 30 seconds for startup

# 4. Access services
# n8n:         http://localhost:5678 (admin/admin)
# Browserless: http://localhost:3000
```

### Verify Setup:
```bash
# Check containers are running
docker ps

# Check logs
docker logs agentic-browser-server
docker logs n8n-test

# Run automated tests
bash /tmp/test-agentic-browser-setup.sh
```

### Import Workflow:
1. Open n8n: http://localhost:5678
2. Login: admin/admin
3. Click "Import from File"
4. Select: `/tmp/agentic-browser-test-workflow.json`
5. Click "Import"

### Configure Connection:
```
In each node:
  Connection Type: "browserless"
  Remote Browser URL: "ws://browserless:3000?token=secret-token-change-me"
```

### Execute Workflow:
1. Click "Execute Workflow"
2. Watch the execution in real-time
3. See results in each node

---

## 💻 Option 2: Build from Source

### Prerequisites:
```bash
# Ensure you have:
- Node.js 18+
- pnpm
- Chrome/Chromium installed
```

### Build Steps:
```bash
# 1. Navigate to n8n directory
cd /home/user/n8n

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build > build.log 2>&1

# 4. Check for errors
tail -50 build.log

# 5. Start n8n in dev mode
pnpm dev
```

### Access n8n:
```
Open: http://localhost:5678
```

### Import Workflow:
```
File → Import from File
Select: /tmp/agentic-browser-test-workflow.json
```

---

## 🌐 Option 3: Use Existing n8n

If you already have n8n running:

### 1. Copy Node Files:
```bash
# Copy AgenticBrowser node to your n8n
cp -r /home/user/n8n/packages/nodes-base/nodes/AgenticBrowser \
     /path/to/your/n8n/nodes/
```

### 2. Install Dependencies:
```bash
cd /path/to/your/n8n
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

### 3. Restart n8n:
```bash
# Restart your n8n instance
systemctl restart n8n
# or
pm2 restart n8n
```

### 4. Import Workflow:
```
Import: /tmp/agentic-browser-test-workflow.json
```

---

## 🧪 Test Scenarios

### Scenario 1: Basic Navigation (No Browser Required)
```bash
# Just simulate the workflow logic
node /home/user/n8n/test-agentic-browser/launch-test-instance.js
```

### Scenario 2: Local Browser Test
```bash
# Requires Chrome installed
# Set connectionType: "local"
# Execute workflow in n8n
```

### Scenario 3: Remote Browser Test
```bash
# Start Browserless
docker run -d -p 3000:3000 \
  -e TOKEN=test-token \
  browserless/chrome:latest

# Configure n8n
connectionType: "browserless"
remoteBrowserUrl: "ws://localhost:3000?token=test-token"

# Execute workflow
```

### Scenario 4: Production Setup
```bash
# Use BrowserBase or Browserless.io
connectionType: "browserbase"
apiKey: "your-api-key"

# Or
connectionType: "browserless"
remoteBrowserUrl: "wss://chrome.browserless.io?token=your-token"
```

---

## 📊 Expected Results

### Session Creation:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "headless": true,
  "windowWidth": 1920,
  "windowHeight": 1080,
  "success": true
}
```

### Navigation:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "pageId": "default",
  "url": "https://www.perplexity.ai/",
  "status": 200,
  "success": true
}
```

### Chat Message:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "custom",
  "message": "What is quantum computing?",
  "response": "Quantum computing is a type of computing that...",
  "messageSent": true,
  "success": true
}
```

### Text Extraction:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Quantum computing is a revolutionary approach...",
  "success": true
}
```

### Screenshot:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "success": true,
  "binary": {
    "screenshot": {
      "data": "base64-encoded-image-data",
      "mimeType": "image/png",
      "fileName": "screenshot.png"
    }
  }
}
```

---

## 🔧 Configuration Options

### Basic Configuration:
```json
{
  "connectionType": "local",
  "headless": true,
  "windowWidth": 1920,
  "windowHeight": 1080
}
```

### Anti-Detection Configuration:
```json
{
  "connectionType": "browserless",
  "remoteBrowserUrl": "wss://your-server:3000",
  "fingerprintRandomize": true,
  "humanBehaviorEnabled": true,
  "typingDelayMin": 50,
  "typingDelayMax": 150,
  "clickDelayMin": 500,
  "clickDelayMax": 2000
}
```

### Production Configuration:
```json
{
  "connectionType": "browserbase",
  "apiKey": "YOUR_API_KEY",
  "proxyServer": "residential.proxy.com:12321",
  "proxyUsername": "user",
  "proxyPassword": "pass",
  "fingerprintRandomize": true,
  "humanBehaviorEnabled": true,
  "userDataDir": "/persistent/sessions/user1"
}
```

---

## 🐛 Troubleshooting

### "Cannot find module puppeteer"
```bash
# Install dependencies
cd /home/user/n8n/packages/nodes-base
pnpm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

### "Chrome not found"
```bash
# For Docker: Use browserless image (includes Chrome)
docker run -d -p 3000:3000 browserless/chrome:latest

# For local: Install Chrome
# Ubuntu/Debian:
apt-get install chromium-browser

# macOS:
brew install chromium

# Windows:
# Download from: https://www.google.com/chrome/
```

### "Connection refused to Browserless"
```bash
# Check if container is running
docker ps | grep browserless

# Check logs
docker logs agentic-browser-server

# Restart container
docker restart agentic-browser-server
```

### "Node not found in n8n"
```bash
# Rebuild n8n
cd /home/user/n8n
pnpm build

# Check node is registered
grep -r "AgenticBrowser" packages/nodes-base/package.json

# Restart n8n
```

### "Workflow execution fails"
```bash
# Check Chrome is accessible
curl http://localhost:3000

# Check n8n can reach Browserless
# In n8n container:
docker exec -it n8n-test wget -O- http://browserless:3000

# Check logs
docker logs n8n-test
```

---

## 📈 Performance Tips

### For Better Performance:
1. **Use Remote Browser**
   - Offloads CPU/memory from n8n server
   - Better resource management
   - Can scale horizontally

2. **Enable Session Persistence**
   - Reuse browser sessions
   - Faster subsequent runs
   - Maintains login state

3. **Optimize Wait Times**
   - Use appropriate wait conditions
   - Don't wait longer than necessary
   - Use `networkidle2` for dynamic sites

4. **Limit Screenshot Size**
   - Use `fullPage: false` when possible
   - Reduce quality for JPEG
   - Screenshots consume memory

---

## 🔒 Security Considerations

### Production Checklist:
- [ ] Change default Browserless token
- [ ] Use HTTPS for remote connections
- [ ] Store credentials in n8n credential manager
- [ ] Enable authentication on Browserless
- [ ] Use firewall rules to restrict access
- [ ] Regularly update Docker images
- [ ] Monitor for suspicious activity
- [ ] Use separate user data directories per account
- [ ] Implement rate limiting
- [ ] Log all automation activities

---

## 📚 Next Steps

### After Successful Launch:

1. **Test with Free LLMs**
   - Start with Perplexity (most reliable)
   - Try HuggingChat
   - Test DuckDuckGo AI

2. **Enable Anti-Detection**
   - Turn on fingerprint randomization
   - Enable human behavior simulation
   - Add residential proxies

3. **Persist Sessions**
   - Configure user data directories
   - Log in manually once (headless: false)
   - Reuse sessions across workflows

4. **Monitor Performance**
   - Check execution times
   - Monitor memory usage
   - Track success rates

5. **Scale to Production**
   - Use BrowserBase or Browserless.io
   - Add proxy rotation
   - Implement error handling
   - Set up monitoring/alerts

---

## 🎉 Success Indicators

You'll know the instance is working when:

✅ Browserless accessible at http://localhost:3000
✅ n8n accessible at http://localhost:5678
✅ Workflow imports without errors
✅ Session creation returns sessionId
✅ Navigation loads pages successfully
✅ Chat messages send with human delays
✅ Responses extracted correctly
✅ Screenshots captured as binary data

---

## 📞 Support Resources

### Documentation:
- Setup Guide: `REMOTE_BROWSER_SETUP.md`
- Anti-Ban Guide: `ANTI_BAN_ARCHITECTURE.md`
- LLM Testing: `FREE_LLM_TESTING.md`
- Test Report: `E2E_TEST_REPORT.md`

### Generated Files:
- Workflow: `/tmp/agentic-browser-test-workflow.json`
- Docker Compose: `/tmp/docker-compose-agentic-browser.yml`
- Test Script: `/tmp/test-agentic-browser-setup.sh`

### Live Examples:
```bash
# View workflow
cat /tmp/agentic-browser-test-workflow.json | jq .

# View Docker setup
cat /tmp/docker-compose-agentic-browser.yml

# Run tests
bash /tmp/test-agentic-browser-setup.sh
```

---

**Ready to launch? Choose your option above and get started!** 🚀
