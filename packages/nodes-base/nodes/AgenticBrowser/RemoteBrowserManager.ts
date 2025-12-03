import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { v4 as uuid } from 'uuid';
import type { BrowserSessionData, SessionOptions } from './types';

// Add stealth plugin
puppeteer.use(StealthPlugin());

export interface RemoteBrowserOptions {
	connectionType: 'local' | 'remote' | 'browserless' | 'browserbase';
	remoteBrowserUrl?: string; // For Browserless or custom remote browser
	apiKey?: string; // For BrowserBase or Browserless
	proxyConfig?: ProxyConfig;
	humanBehavior?: HumanBehaviorConfig;
	fingerprint?: FingerprintConfig;
}

export interface ProxyConfig {
	server: string;
	username?: string;
	password?: string;
	type?: 'http' | 'https' | 'socks5' | 'residential';
}

export interface HumanBehaviorConfig {
	enabled: boolean;
	typingDelayMin?: number; // ms per character
	typingDelayMax?: number;
	clickDelayMin?: number; // ms before click
	clickDelayMax?: number;
	scrollSmooth?: boolean;
	mouseMovement?: boolean;
	readingTime?: number; // ms to wait before extracting response
}

export interface FingerprintConfig {
	randomize: boolean;
	userAgent?: 'random' | 'chrome' | 'firefox' | string;
	viewportRandomize?: boolean;
	timezone?: string;
	locale?: string;
}

/**
 * Enhanced BrowserManager with remote browser and anti-detection support
 */
class RemoteBrowserManagerClass {
	private sessions: Map<string, BrowserSessionData> = new Map();
	private readonly DEFAULT_TIMEOUT = 30000;

	/**
	 * Get random user agent
	 */
	private getRandomUserAgent(): string {
		const userAgents = [
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		];
		return userAgents[Math.floor(Math.random() * userAgents.length)];
	}

	/**
	 * Get random viewport
	 */
	private getRandomViewport(): { width: number; height: number } {
		const viewports = [
			{ width: 1920, height: 1080 },
			{ width: 1366, height: 768 },
			{ width: 1536, height: 864 },
			{ width: 1440, height: 900 },
			{ width: 1280, height: 720 },
		];
		return viewports[Math.floor(Math.random() * viewports.length)];
	}

	/**
	 * Get random delay within range
	 */
	private getRandomDelay(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Create a new browser session with enhanced options
	 */
	async createSession(
		options: SessionOptions = {},
		remoteOptions?: RemoteBrowserOptions,
	): Promise<string> {
		const sessionId = uuid();

		let browser: Browser;

		// Determine connection type
		const connectionType = remoteOptions?.connectionType || 'local';

		if (connectionType === 'browserless' && remoteOptions?.remoteBrowserUrl) {
			// Connect to Browserless
			browser = await puppeteer.connect({
				browserWSEndpoint: remoteOptions.remoteBrowserUrl,
			});
		} else if (connectionType === 'browserbase' && remoteOptions?.apiKey) {
			// Connect to BrowserBase
			const browserbaseUrl = `wss://connect.browserbase.com?apiKey=${remoteOptions.apiKey}`;
			browser = await puppeteer.connect({
				browserWSEndpoint: browserbaseUrl,
			});
		} else if (connectionType === 'remote' && remoteOptions?.remoteBrowserUrl) {
			// Connect to custom remote browser
			browser = await puppeteer.connect({
				browserWSEndpoint: remoteOptions.remoteBrowserUrl,
			});
		} else {
			// Local browser launch
			const launchOptions: PuppeteerLaunchOptions = {
				headless: options.headless !== false,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-accelerated-2d-canvas',
					'--no-first-run',
					'--no-zygote',
					'--disable-gpu',
					'--disable-blink-features=AutomationControlled', // Hide automation
				],
			};

			// Add user data dir for session persistence
			if (options.userDataDir) {
				launchOptions.userDataDir = options.userDataDir;
			}

			// Add proxy if configured
			if (remoteOptions?.proxyConfig?.server) {
				launchOptions.args?.push(`--proxy-server=${remoteOptions.proxyConfig.server}`);
			}

			browser = await puppeteer.launch(launchOptions);
		}

		const pages = new Map<string, Page>();

		// Get the default page
		const defaultPages = await browser.pages();
		if (defaultPages.length > 0) {
			const pageId = 'default';
			const page = defaultPages[0];

			// Determine viewport
			let viewport = { width: options.windowWidth ?? 1920, height: options.windowHeight ?? 1080 };
			if (remoteOptions?.fingerprint?.viewportRandomize) {
				viewport = this.getRandomViewport();
			}

			await page.setViewport(viewport);

			// Determine user agent
			let userAgent = options.userAgent;
			if (remoteOptions?.fingerprint?.randomize) {
				userAgent = this.getRandomUserAgent();
			}
			if (userAgent) {
				await page.setUserAgent(userAgent);
			}

			// Set timezone if specified
			if (remoteOptions?.fingerprint?.timezone) {
				await page.emulateTimezone(remoteOptions.fingerprint.timezone);
			}

			// Set locale if specified
			if (remoteOptions?.fingerprint?.locale) {
				await page.setExtraHTTPHeaders({
					'Accept-Language': remoteOptions.fingerprint.locale,
				});
			}

			// Hide webdriver flag
			await page.evaluateOnNewDocument(() => {
				// Override navigator.webdriver
				Object.defineProperty(navigator, 'webdriver', {
					get: () => false,
				});

				// Override chrome detection
				(window as any).chrome = {
					runtime: {},
				};

				// Override permissions
				const originalQuery = window.navigator.permissions.query;
				window.navigator.permissions.query = (parameters: any) =>
					parameters.name === 'notifications'
						? Promise.resolve({ state: 'denied' } as PermissionStatus)
						: originalQuery(parameters);
			});

			// Set default timeout
			page.setDefaultTimeout(this.DEFAULT_TIMEOUT);

			pages.set(pageId, page);
		}

		this.sessions.set(sessionId, {
			browserId: sessionId,
			browser,
			pages,
			createdAt: Date.now(),
			userDataDir: options.userDataDir,
		});

		return sessionId;
	}

	/**
	 * Type text with human-like delays
	 */
	async typeWithHumanBehavior(
		page: Page,
		selector: string,
		text: string,
		humanBehavior?: HumanBehaviorConfig,
	): Promise<void> {
		if (humanBehavior?.enabled) {
			const delayMin = humanBehavior.typingDelayMin ?? 50;
			const delayMax = humanBehavior.typingDelayMax ?? 150;

			// Type character by character with random delays
			await page.click(selector);
			for (const char of text) {
				const delay = this.getRandomDelay(delayMin, delayMax);
				await page.keyboard.type(char, { delay });
			}
		} else {
			await page.type(selector, text);
		}
	}

	/**
	 * Click with human-like delay
	 */
	async clickWithHumanBehavior(
		page: Page,
		selector: string,
		humanBehavior?: HumanBehaviorConfig,
	): Promise<void> {
		if (humanBehavior?.enabled) {
			const delayMin = humanBehavior.clickDelayMin ?? 500;
			const delayMax = humanBehavior.clickDelayMax ?? 2000;
			const delay = this.getRandomDelay(delayMin, delayMax);

			// Optional: Move mouse to element first
			if (humanBehavior.mouseMovement) {
				const element = await page.$(selector);
				if (element) {
					const box = await element.boundingBox();
					if (box) {
						await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
					}
				}
			}

			await page.waitForTimeout(delay);
			await page.click(selector);
		} else {
			await page.click(selector);
		}
	}

	/**
	 * Wait with human reading time
	 */
	async waitForReading(page: Page, humanBehavior?: HumanBehaviorConfig): Promise<void> {
		if (humanBehavior?.enabled && humanBehavior.readingTime) {
			await page.waitForTimeout(humanBehavior.readingTime);
		}
	}

	/**
	 * Get a browser session by ID
	 */
	getSession(sessionId: string): BrowserSessionData | undefined {
		return this.sessions.get(sessionId);
	}

	/**
	 * Get a page from a session
	 */
	async getPage(sessionId: string, pageId: string = 'default'): Promise<Page> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		let page = session.pages.get(pageId);
		if (!page) {
			page = await session.browser.newPage();
			session.pages.set(pageId, page);
		}

		return page;
	}

	/**
	 * Close a browser session
	 */
	async closeSession(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		for (const [pageId, page] of session.pages) {
			try {
				await page.close();
			} catch (error) {
				console.error(`Error closing page ${pageId}:`, error);
			}
		}

		try {
			await session.browser.close();
		} catch (error) {
			console.error(`Error closing browser ${sessionId}:`, error);
		}

		this.sessions.delete(sessionId);
	}

	/**
	 * List all active sessions
	 */
	listSessions(): Array<{ sessionId: string; createdAt: number; pageCount: number }> {
		return Array.from(this.sessions.entries()).map(([sessionId, session]) => ({
			sessionId,
			createdAt: session.createdAt,
			pageCount: session.pages.size,
		}));
	}

	/**
	 * Close all sessions
	 */
	async closeAllSessions(): Promise<void> {
		const sessionIds = Array.from(this.sessions.keys());
		await Promise.all(sessionIds.map((id) => this.closeSession(id)));
	}

	/**
	 * Get session cookies
	 */
	async getSessionCookies(sessionId: string, pageId: string = 'default'): Promise<unknown[]> {
		const page = await this.getPage(sessionId, pageId);
		return await page.cookies();
	}

	/**
	 * Set session cookies
	 */
	async setSessionCookies(
		sessionId: string,
		cookies: unknown[],
		pageId: string = 'default',
	): Promise<void> {
		const page = await this.getPage(sessionId, pageId);
		await page.setCookie(...(cookies as Parameters<Page['setCookie']>));
	}
}

// Export singleton instance
export const RemoteBrowserManager = new RemoteBrowserManagerClass();
