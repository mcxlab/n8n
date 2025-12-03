#!/usr/bin/env node

/**
 * Agentic Browser Test Instance
 * Demonstrates the node functionality without full n8n build
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

console.log('🚀 Agentic Browser Test Instance\n');
console.log('═══════════════════════════════════════════════════════\n');

// Simulated node execution context
class SimulatedExecutionContext {
  constructor() {
    this.parameters = new Map();
    this.inputData = [];
  }

  getNodeParameter(name, index, defaultValue) {
    const key = `${name}_${index}`;
    return this.parameters.get(key) || defaultValue;
  }

  setNodeParameter(name, index, value) {
    const key = `${name}_${index}`;
    this.parameters.set(key, value);
  }

  getInputData() {
    return this.inputData;
  }

  async helpers() {
    return {
      prepareBinaryData: async (buffer, filename, mimeType) => {
        return {
          data: buffer.toString('base64'),
          fileName: filename,
          mimeType: mimeType
        };
      }
    };
  }
}

// Test scenarios
const testScenarios = [
  {
    name: 'Session Creation',
    description: 'Create a new browser session with anti-detection',
    resource: 'session',
    operation: 'create',
    parameters: {
      headless: true,
      windowWidth: 1920,
      windowHeight: 1080,
      connectionType: 'local',
      fingerprintRandomize: true,
      humanBehaviorEnabled: true
    }
  },
  {
    name: 'Navigate to Perplexity',
    description: 'Navigate to free LLM interface',
    resource: 'navigation',
    operation: 'goto',
    parameters: {
      sessionId: 'test-session-123',
      url: 'https://www.perplexity.ai/',
      waitUntil: 'networkidle2'
    }
  },
  {
    name: 'Send Chat Message',
    description: 'Send message to LLM with human behavior',
    resource: 'chat',
    operation: 'sendMessage',
    parameters: {
      sessionId: 'test-session-123',
      provider: 'custom',
      message: 'What is quantum computing?',
      inputSelector: 'textarea',
      submitSelector: 'button[aria-label="Submit"]',
      waitForResponse: true,
      humanBehaviorEnabled: true,
      typingDelayMin: 50,
      typingDelayMax: 150
    }
  },
  {
    name: 'Extract Response',
    description: 'Extract text from LLM response',
    resource: 'extraction',
    operation: 'getText',
    parameters: {
      sessionId: 'test-session-123',
      selector: '.prose',
      multiple: false
    }
  },
  {
    name: 'Take Screenshot',
    description: 'Capture screenshot of the page',
    resource: 'extraction',
    operation: 'screenshot',
    parameters: {
      sessionId: 'test-session-123',
      fullPage: false,
      type: 'png'
    }
  }
];

// Simulate execution
async function simulateExecution() {
  console.log('📋 Test Scenarios:\n');

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`${i + 1}. ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    console.log(`   Resource: ${scenario.resource}, Operation: ${scenario.operation}`);

    // Show parameters
    console.log('   Parameters:');
    for (const [key, value] of Object.entries(scenario.parameters)) {
      const displayValue = typeof value === 'string' && value.length > 50
        ? value.substring(0, 47) + '...'
        : value;
      console.log(`     ${key}: ${JSON.stringify(displayValue)}`);
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════\n');
  console.log('💡 Execution Flow:\n');
  console.log('1️⃣  Create Session');
  console.log('   ↓ Returns: { sessionId: "uuid-here" }');
  console.log('');
  console.log('2️⃣  Navigate to URL');
  console.log('   ↓ Uses: sessionId from step 1');
  console.log('   ↓ Returns: { url: "...", status: 200 }');
  console.log('');
  console.log('3️⃣  Send Chat Message');
  console.log('   ↓ Types with human delays (50-150ms/char)');
  console.log('   ↓ Clicks submit button');
  console.log('   ↓ Waits for response');
  console.log('   ↓ Returns: { message, response }');
  console.log('');
  console.log('4️⃣  Extract Response');
  console.log('   ↓ Gets text from selector');
  console.log('   ↓ Returns: { text: "..." }');
  console.log('');
  console.log('5️⃣  Take Screenshot');
  console.log('   ↓ Captures page image');
  console.log('   ↓ Returns: binary screenshot data');
  console.log('');
  console.log('═══════════════════════════════════════════════════════\n');

  // Generate workflow JSON
  const workflow = {
    name: 'Agentic Browser Test Workflow',
    nodes: testScenarios.map((scenario, index) => ({
      id: `node-${index + 1}`,
      name: scenario.name,
      type: 'n8n-nodes-base.agenticBrowser',
      typeVersion: 1,
      position: [250, 100 + (index * 150)],
      parameters: {
        resource: scenario.resource,
        operation: scenario.operation,
        ...scenario.parameters
      }
    })),
    connections: {
      'node-1': { main: [[{ node: 'node-2', type: 'main', index: 0 }]] },
      'node-2': { main: [[{ node: 'node-3', type: 'main', index: 0 }]] },
      'node-3': { main: [[{ node: 'node-4', type: 'main', index: 0 }]] },
      'node-4': { main: [[{ node: 'node-5', type: 'main', index: 0 }]] }
    }
  };

  // Save workflow
  const workflowPath = '/tmp/agentic-browser-test-workflow.json';
  await writeFile(workflowPath, JSON.stringify(workflow, null, 2));
  console.log(`✅ Workflow saved to: ${workflowPath}\n`);

  return workflow;
}

// Generate configuration examples
async function generateConfigExamples() {
  console.log('📝 Configuration Examples:\n');

  const examples = [
    {
      name: 'Basic Local Browser',
      config: {
        connectionType: 'local',
        headless: true,
        userDataDir: '/tmp/browser-sessions/chatgpt'
      }
    },
    {
      name: 'Browserless (Managed)',
      config: {
        connectionType: 'browserless',
        remoteBrowserUrl: 'wss://chrome.browserless.io?token=YOUR_TOKEN',
        fingerprintRandomize: true
      }
    },
    {
      name: 'Self-Hosted with Proxy',
      config: {
        connectionType: 'browserless',
        remoteBrowserUrl: 'wss://your-vps:3000?token=SECRET',
        proxyServer: 'residential.smartproxy.com:12321',
        proxyUsername: 'user-xxx',
        proxyPassword: 'pass-xxx',
        fingerprintRandomize: true,
        humanBehaviorEnabled: true
      }
    },
    {
      name: 'BrowserBase (Enterprise)',
      config: {
        connectionType: 'browserbase',
        apiKey: 'YOUR_BROWSERBASE_API_KEY',
        fingerprintRandomize: true
      }
    }
  ];

  for (const example of examples) {
    console.log(`\n🔧 ${example.name}:`);
    console.log(JSON.stringify(example.config, null, 2));
  }

  console.log('\n');
}

// Generate Docker compose for test environment
async function generateDockerCompose() {
  console.log('🐳 Docker Compose Setup:\n');

  const dockerCompose = `version: '3.8'

services:
  # Browserless - Remote browser server
  browserless:
    image: browserless/chrome:latest
    container_name: agentic-browser-server
    ports:
      - "3000:3000"
    environment:
      - MAX_CONCURRENT_SESSIONS=10
      - CONNECTION_TIMEOUT=600000
      - TOKEN=\${BROWSERLESS_TOKEN:-secret-token-change-me}
      - ENABLE_CORS=true
      - KEEP_ALIVE=true
    restart: unless-stopped

  # Optional: n8n for testing
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-test
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    depends_on:
      - browserless

volumes:
  n8n_data:
`;

  await writeFile('/tmp/docker-compose-agentic-browser.yml', dockerCompose);
  console.log('✅ Docker Compose saved to: /tmp/docker-compose-agentic-browser.yml\n');

  console.log('🚀 Quick Start:\n');
  console.log('# 1. Start services');
  console.log('docker-compose -f /tmp/docker-compose-agentic-browser.yml up -d\n');
  console.log('# 2. Access n8n');
  console.log('http://localhost:5678 (admin/admin)\n');
  console.log('# 3. Access Browserless');
  console.log('http://localhost:3000\n');
  console.log('# 4. Configure Agentic Browser node:');
  console.log('Connection Type: browserless');
  console.log('Remote URL: ws://browserless:3000?token=secret-token-change-me\n');
}

// Generate test scripts
async function generateTestScripts() {
  console.log('📜 Test Scripts:\n');

  // Bash test script
  const bashScript = `#!/bin/bash
# Agentic Browser Test Script

echo "🧪 Testing Agentic Browser Setup"
echo ""

# Test 1: Check if Browserless is running
echo "1️⃣  Testing Browserless connection..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Browserless is running"
else
    echo "   ❌ Browserless is not running"
    echo "   Start it with: docker-compose up -d browserless"
    exit 1
fi

# Test 2: Check WebSocket connection
echo ""
echo "2️⃣  Testing WebSocket endpoint..."
if curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3000 2>&1 | grep -q "101"; then
    echo "   ✅ WebSocket endpoint is accessible"
else
    echo "   ⚠️  WebSocket test inconclusive (may still work)"
fi

# Test 3: Check n8n if running
echo ""
echo "3️⃣  Testing n8n connection..."
if curl -s http://localhost:5678 > /dev/null; then
    echo "   ✅ n8n is running at http://localhost:5678"
else
    echo "   ℹ️  n8n is not running (optional)"
fi

echo ""
echo "✅ Setup tests complete!"
echo ""
echo "Next steps:"
echo "1. Open n8n: http://localhost:5678"
echo "2. Create new workflow"
echo "3. Add 'Agentic Browser' node"
echo "4. Configure with: ws://browserless:3000?token=secret-token-change-me"
`;

  await writeFile('/tmp/test-agentic-browser-setup.sh', bashScript);
  await Deno.chmod?.('/tmp/test-agentic-browser-setup.sh', 0o755).catch(() => {});
  console.log('✅ Test script saved to: /tmp/test-agentic-browser-setup.sh\n');
}

// Main execution
async function main() {
  try {
    // Run simulations
    await simulateExecution();
    await generateConfigExamples();
    await generateDockerCompose();
    await generateTestScripts();

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🎉 Test Instance Ready!\n');

    console.log('📂 Generated Files:');
    console.log('   • /tmp/agentic-browser-test-workflow.json');
    console.log('   • /tmp/docker-compose-agentic-browser.yml');
    console.log('   • /tmp/test-agentic-browser-setup.sh\n');

    console.log('🚀 To Launch Real Instance:\n');
    console.log('Option 1: Docker Compose (Recommended)');
    console.log('   cd /tmp');
    console.log('   docker-compose -f docker-compose-agentic-browser.yml up -d');
    console.log('   Open http://localhost:5678 (admin/admin)\n');

    console.log('Option 2: Build from Source');
    console.log('   cd /home/user/n8n');
    console.log('   pnpm install');
    console.log('   pnpm build');
    console.log('   pnpm dev\n');

    console.log('Option 3: Use Existing n8n');
    console.log('   1. Import workflow: /tmp/agentic-browser-test-workflow.json');
    console.log('   2. Configure Browserless URL');
    console.log('   3. Execute workflow\n');

    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💡 Configuration Tips:\n');
    console.log('For Personal Use:');
    console.log('   • Use self-hosted Browserless ($6/mo VPS)');
    console.log('   • Add residential proxy ($50/mo)');
    console.log('   • Enable human behavior simulation\n');

    console.log('For Production:');
    console.log('   • Use BrowserBase ($100/mo)');
    console.log('   • Built-in proxies and anti-detection');
    console.log('   • Auto-scaling and monitoring\n');

    console.log('🔒 Security Reminder:');
    console.log('   • Change default tokens');
    console.log('   • Use HTTPS for remote connections');
    console.log('   • Store credentials in n8n credential manager\n');

    console.log('📚 Documentation:');
    console.log('   • Setup Guide: test-agentic-browser/REMOTE_BROWSER_SETUP.md');
    console.log('   • Anti-Ban Guide: test-agentic-browser/ANTI_BAN_ARCHITECTURE.md');
    console.log('   • LLM Testing: test-agentic-browser/FREE_LLM_TESTING.md\n');

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
main();
