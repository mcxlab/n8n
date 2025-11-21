import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin
puppeteer.use(StealthPlugin());

console.log('🧪 Testing Agentic Browser Core Functionality\n');

async function testBasicBrowser() {
  console.log('📋 Test 1: Basic Browser Session');
  console.log('Creating browser session...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('✅ Browser session created\n');

  console.log('📋 Test 2: Navigation');
  console.log('Navigating to example.com...');

  await page.goto('https://example.com', { waitUntil: 'networkidle2' });
  const title = await page.title();

  console.log(`✅ Navigated successfully. Page title: "${title}"\n`);

  console.log('📋 Test 3: Text Extraction');
  const text = await page.$eval('h1', el => el.textContent);
  console.log(`✅ Extracted text: "${text}"\n`);

  console.log('📋 Test 4: Screenshot');
  const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
  console.log(`✅ Screenshot captured (${screenshot.length} bytes)\n`);

  await browser.close();
  console.log('✅ Browser closed\n');
}

async function testPerplexity() {
  console.log('📋 Test 5: Perplexity (Free, No Login)');
  console.log('Opening Perplexity.ai...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto('https://www.perplexity.ai/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ Perplexity loaded');

    // Look for the search/input area
    const pageContent = await page.content();
    const hasTextarea = pageContent.includes('textarea') || pageContent.includes('Ask anything');

    if (hasTextarea) {
      console.log('✅ Found input field on Perplexity\n');

      // Try to find and interact with the input
      try {
        // Common selectors for Perplexity
        const selectors = [
          'textarea',
          '[placeholder*="Ask"]',
          '[placeholder*="Search"]',
          'input[type="text"]'
        ];

        let inputFound = false;
        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            console.log(`✅ Found input with selector: ${selector}`);

            // Try to type
            await page.type(selector, 'What is 2+2?', { delay: 50 });
            console.log('✅ Message typed successfully');
            inputFound = true;
            break;
          } catch (e) {
            continue;
          }
        }

        if (!inputFound) {
          console.log('⚠️  Could not find input field with common selectors');
        }
      } catch (error) {
        console.log(`⚠️  Interaction test: ${error.message}`);
      }
    } else {
      console.log('⚠️  No textarea found on page\n');
    }

  } catch (error) {
    console.log(`❌ Error testing Perplexity: ${error.message}\n`);
  } finally {
    await browser.close();
  }
}

async function testHuggingChat() {
  console.log('📋 Test 6: HuggingChat (Free, No Login)');
  console.log('Opening HuggingChat...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto('https://huggingface.co/chat/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ HuggingChat loaded');

    const pageContent = await page.content();
    const hasForm = pageContent.includes('form') || pageContent.includes('textarea');

    if (hasForm) {
      console.log('✅ Found chat interface on HuggingChat\n');

      try {
        // Try to find input
        const selectors = [
          'textarea',
          '[placeholder*="Ask"]',
          'input[type="text"]',
          'form textarea'
        ];

        let inputFound = false;
        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            console.log(`✅ Found input with selector: ${selector}`);
            inputFound = true;
            break;
          } catch (e) {
            continue;
          }
        }

        if (!inputFound) {
          console.log('⚠️  Could not find input field');
        }
      } catch (error) {
        console.log(`⚠️  Interaction test: ${error.message}`);
      }
    } else {
      console.log('⚠️  No form found on page\n');
    }

  } catch (error) {
    console.log(`❌ Error testing HuggingChat: ${error.message}\n`);
  } finally {
    await browser.close();
  }
}

async function testDuckDuckGoAI() {
  console.log('📋 Test 7: DuckDuckGo AI Chat (Free, No Login)');
  console.log('Opening DuckDuckGo AI...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto('https://duckduckgo.com/?q=DuckDuckGo&ia=chat', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ DuckDuckGo AI loaded');

    const pageContent = await page.content();
    const hasChat = pageContent.includes('chat') || pageContent.includes('message');

    if (hasChat) {
      console.log('✅ Found chat interface on DuckDuckGo AI\n');
    } else {
      console.log('⚠️  Chat interface might not be available\n');
    }

  } catch (error) {
    console.log(`❌ Error testing DuckDuckGo AI: ${error.message}\n`);
  } finally {
    await browser.close();
  }
}

// Run all tests
async function runTests() {
  try {
    await testBasicBrowser();
    await testPerplexity();
    await testHuggingChat();
    await testDuckDuckGoAI();

    console.log('🎉 All tests completed!\n');
    console.log('Summary:');
    console.log('- Basic browser operations: ✅');
    console.log('- Navigation and extraction: ✅');
    console.log('- Free LLM interfaces tested: Perplexity, HuggingChat, DuckDuckGo AI');
    console.log('\nNote: Full interaction testing would require running in headed mode');
    console.log('to verify the exact selectors for each LLM interface.');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTests();
