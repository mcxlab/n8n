# Remote Browser Setup Guide
## Avoiding Bans with Dedicated Browser Infrastructure

This guide shows you how to set up a remote browser server to avoid getting banned when automating LLM interfaces.

---

## 🚨 Why You Need This

**Running browsers directly from n8n = HIGH RISK**

Problems:
- ❌ Uses your n8n server's IP (easily banned)
- ❌ Same browser fingerprint every time
- ❌ No IP rotation
- ❌ Predictable patterns
- ❌ Personal accounts at risk

**Remote browser server = LOW RISK**

Benefits:
- ✅ Separate IP address
- ✅ Can use residential proxies
- ✅ Persistent sessions across workflows
- ✅ Better fingerprint management
- ✅ Professional anti-detection

---

## 📋 Setup Options

### Option 1: Browserless (Easiest) ⭐

**Cost**: $49-$199/month
**Setup Time**: 5 minutes
**Best For**: Production use, teams

#### Quick Start:
```bash
# 1. Sign up at browserless.io

# 2. Get your connection URL:
#    wss://chrome.browserless.io?token=YOUR_TOKEN

# 3. In n8n workflow:
Session → Create:
  Connection Type: "browserless"
  Remote Browser URL: "wss://chrome.browserless.io?token=YOUR_TOKEN"
  Headless: true
```

**Features**:
- Built-in stealth mode
- Automatic session management
- Pre-configured anti-detection
- No maintenance required

---

### Option 2: Self-Hosted Browserless (Best Value) ⭐⭐

**Cost**: $5-10/month (VPS)
**Setup Time**: 15 minutes
**Best For**: Personal use, budget-conscious

#### Step-by-Step:

1. **Get a VPS** (DigitalOcean, Linode, Vultr):
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

2. **Run Browserless Docker Container**:
```bash
docker run -d \
  --name browserless \
  --restart always \
  -p 3000:3000 \
  -e "MAX_CONCURRENT_SESSIONS=10" \
  -e "CONNECTION_TIMEOUT=600000" \
  -e "TOKEN=your-secret-token-here" \
  browserless/chrome:latest
```

3. **Configure in n8n**:
```
Session → Create:
  Connection Type: "browserless"
  Remote Browser URL: "wss://your-vps-ip:3000?token=your-secret-token-here"
```

4. **Add HTTPS (recommended)**:
```bash
# Install nginx and certbot
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Configure nginx for WebSocket
cat > /etc/nginx/sites-available/browserless <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

ln -s /etc/nginx/sites-available/browserless /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

5. **Use with HTTPS**:
```
Remote Browser URL: "wss://your-domain.com?token=your-secret-token-here"
```

---

### Option 3: BrowserBase (Most Advanced) ⭐⭐⭐

**Cost**: $100+/month
**Setup Time**: 2 minutes
**Best For**: Enterprise, scaling

#### Quick Start:
```bash
# 1. Sign up at browserbase.com

# 2. Get your API key

# 3. In n8n workflow:
Session → Create:
  Connection Type: "browserbase"
  API Key: "your-browserbase-api-key"
```

**Features**:
- Built-in residential proxies
- Automatic IP rotation
- Advanced anti-detection
- Session recording
- Chrome DevTools support
- Auto-scaling

---

### Option 4: MCP Browser Server (For AI Workflows) 🤖

**Cost**: $5-10/month (VPS)
**Setup Time**: 30 minutes
**Best For**: Claude Desktop integration, AI agents

#### Create MCP Server:

1. **Create `browser-mcp-server` directory**:
```bash
mkdir browser-mcp-server
cd browser-mcp-server
npm init -y
```

2. **Install dependencies**:
```bash
npm install @modelcontextprotocol/sdk puppeteer-extra puppeteer-extra-plugin-stealth
```

3. **Create `server.js`**:
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const sessions = new Map();

const server = new Server({
  name: 'browser-automation',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Tool: Create Browser Session
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'create_browser') {
    const sessionId = Date.now().toString();
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    sessions.set(sessionId, { browser, page });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ sessionId })
      }]
    };
  }

  if (request.params.name === 'navigate') {
    const { sessionId, url } = request.params.arguments;
    const session = sessions.get(sessionId);
    await session.page.goto(url);

    return {
      content: [{
        type: 'text',
        text: `Navigated to ${url}`
      }]
    };
  }

  // Add more tools as needed
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

4. **Configure in Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "browser": {
      "command": "node",
      "args": ["/path/to/browser-mcp-server/server.js"]
    }
  }
}
```

---

## 🛡️ Adding Residential Proxies

### Why Residential Proxies?

Residential proxies use real home IPs, making them:
- ✅ Indistinguishable from real users
- ✅ Rarely blocked by LLM providers
- ✅ Support geo-targeting
- ❌ More expensive ($50-200/month)

### Proxy Providers:

#### 1. Bright Data (Best Quality)
```bash
# Premium residential proxies
# Cost: $500/month minimum
# Pros: Highest quality, 72M+ IPs
# Sign up: brightdata.com
```

#### 2. Smartproxy (Good Balance)
```bash
# Affordable residential proxies
# Cost: $50-200/month
# Pros: Good quality, easy to use
# Sign up: smartproxy.com
```

#### 3. Oxylabs (Enterprise)
```bash
# Enterprise-grade proxies
# Cost: $300+/month
# Pros: Best uptime, premium support
# Sign up: oxylabs.io
```

### Configure Proxy in n8n:

```
Session → Create:
  Connection Type: "local" or "remote"
  Proxy Server: "residential.smartproxy.com:12321"
  Proxy Username: "user-customer-xxx"
  Proxy Password: "your-password"
  Proxy Type: "residential"
```

**With Browserless**:
```bash
docker run -d \
  --name browserless \
  -p 3000:3000 \
  -e "PROXY_URL=http://user:pass@residential.smartproxy.com:12321" \
  browserless/chrome:latest
```

---

## 🎯 Anti-Detection Configuration

### 1. Random Fingerprints

```
Session → Create:
  Fingerprint:
    Randomize: true
    User Agent: "random"
    Viewport Randomize: true
    Timezone: "America/New_York"
    Locale: "en-US,en;q=0.9"
```

### 2. Human Behavior Simulation

```
Interaction → Type:
  Human Behavior:
    Enabled: true
    Typing Delay Min: 50
    Typing Delay Max: 150
    Click Delay Min: 500
    Click Delay Max: 2000
    Mouse Movement: true
    Reading Time: 3000
```

### 3. Session Persistence

```
Session → Create:
  User Data Dir: "/persistent/chatgpt-sessions/user1"
  Reuse Session: true
  Session Timeout: 3600000  # 1 hour
```

**Important**: Log in manually once with headless=false, then reuse the session.

---

## 📊 Cost Comparison

| Solution | Monthly Cost | Setup | Ban Risk | Best For |
|----------|-------------|-------|----------|----------|
| **Direct (n8n IP)** | $0 | Easy | 🔴 HIGH | Testing only |
| **Self-Hosted Browserless** | $5-10 | Medium | 🟡 MEDIUM | Personal use |
| **Browserless.io** | $49-199 | Easy | 🟢 LOW | Production |
| **BrowserBase** | $100+ | Easy | 🟢 LOW | Enterprise |
| **+ Residential Proxy** | +$50-200 | Medium | 🟢 VERY LOW | Sensitive accounts |

---

## 🚀 Recommended Setup (Personal Use)

### Budget: ~$15/month

1. **DigitalOcean Droplet** ($6/mo)
   - 1 vCPU, 1GB RAM
   - Ubuntu 22.04
   - Separate IP from n8n

2. **Domain** ($1/mo)
   - For HTTPS (optional but recommended)
   - namecheap.com or similar

3. **Smartproxy** ($8/mo starter)
   - 1GB residential traffic
   - Rotate per request
   - Good for personal accounts

### Setup Steps:

```bash
# 1. Create VPS
doctl compute droplet create browser-server \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-1gb \
  --region nyc3

# 2. SSH in and install
ssh root@<droplet-ip>
curl -fsSL https://get.docker.com | sh

# 3. Run Browserless with proxy
docker run -d \
  --name browserless \
  --restart always \
  -p 3000:3000 \
  -e "MAX_CONCURRENT_SESSIONS=5" \
  -e "TOKEN=$(openssl rand -hex 32)" \
  -e "PROXY_URL=http://user:pass@gate.smartproxy.com:7000" \
  browserless/chrome:latest

# 4. Save the token
docker logs browserless | grep TOKEN

# 5. Use in n8n
Connection Type: "browserless"
Remote Browser URL: "wss://<droplet-ip>:3000?token=<your-token>"
```

---

## 💡 Best Practices

### DO:
✅ **Use different IP than n8n server**
✅ **Add 2-5 second delays between actions**
✅ **Persist sessions (don't re-login every time)**
✅ **Limit to 10-20 requests/hour per session**
✅ **Use residential proxies for personal accounts**
✅ **Randomize fingerprints**
✅ **Monitor for rate limit warnings**

### DON'T:
❌ **Run from n8n server IP**
❌ **Create/destroy browsers rapidly**
❌ **Use datacenter IPs for personal accounts**
❌ **Send requests at exact intervals**
❌ **Ignore captchas (solve them manually)**
❌ **Use same session for multiple accounts**

---

## 🔍 Troubleshooting

### "Connection refused" to remote browser
```bash
# Check if container is running
docker ps | grep browserless

# Check logs
docker logs browserless

# Test connection
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://your-ip:3000
```

### "Proxy authentication failed"
```bash
# Verify proxy credentials
curl -x http://user:pass@proxy:port http://ip-api.com/json

# Update Docker with correct credentials
docker stop browserless
docker rm browserless
# Run again with correct PROXY_URL
```

### "Still getting banned"
- ✅ Verify you're using residential proxy
- ✅ Add more human-like delays (5-10 seconds)
- ✅ Reduce request frequency (max 5-10/hour)
- ✅ Don't reuse same session for multiple workflows
- ✅ Consider rotating proxies more frequently

---

## 🎓 Advanced: IP Rotation Strategy

### Strategy 1: Sticky Sessions
```
Session lasts 10-30 minutes with same IP
Good for: Multi-step conversations
Risk: Medium
```

### Strategy 2: Per-Request Rotation
```
New IP for each request
Good for: Independent queries
Risk: Low
```

### Strategy 3: Geographic Rotation
```
Use IPs from user's actual location
Good for: Matching real user behavior
Risk: Very Low
```

**Recommended**: Sticky sessions (same IP for entire conversation)

---

## 📞 Support

### Self-Hosted Issues:
- Check Docker logs: `docker logs browserless`
- Restart container: `docker restart browserless`
- Update image: `docker pull browserless/chrome:latest`

### Browserless.io Issues:
- Email: support@browserless.io
- Docs: docs.browserless.io

### BrowserBase Issues:
- Discord: discord.gg/browserbase
- Email: support@browserbase.com

---

## 🎉 Summary

**To avoid bans**:
1. ✅ Use remote browser server (separate IP)
2. ✅ Add residential proxies ($50-200/mo)
3. ✅ Enable human behavior simulation
4. ✅ Persist sessions across workflows
5. ✅ Randomize fingerprints
6. ✅ Limit request frequency

**Minimum viable setup**:
- Self-hosted Browserless on VPS ($6/mo)
- Basic residential proxy ($50/mo)
- Human behavior delays (free)

**Total**: ~$56/month for ban-resistant automation

**Zero-config option**:
- BrowserBase ($100/mo) with built-in everything
- Just plug in API key and go

Choose based on your budget and technical comfort level! 🚀
