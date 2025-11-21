import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { v4 as uuid } from 'uuid';
import type { BrowserSessionData, SessionOptions } from './types';

// Add stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

/**
 * Singleton class to manage browser instances across workflow executions
 */
class BrowserManagerClass {
	private sessions: Map<string, BrowserSessionData> = new Map();

	private readonly DEFAULT_TIMEOUT = 30000;

	/**
	 * Create a new browser session
	 */
	async createSession(options: SessionOptions = {}): Promise<string> {
		const sessionId = uuid();

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
			],
		};

		if (options.userDataDir) {
			launchOptions.userDataDir = options.userDataDir;
		}

		if (options.proxy) {
			launchOptions.args?.push(`--proxy-server=${options.proxy}`);
		}

		const browser = await puppeteer.launch(launchOptions);
		const pages = new Map<string, Page>();

		// Get the default page
		const defaultPages = await browser.pages();
		if (defaultPages.length > 0) {
			const pageId = 'default';
			const page = defaultPages[0];

			// Set viewport
			await page.setViewport({
				width: options.windowWidth ?? 1920,
				height: options.windowHeight ?? 1080,
			});

			// Set user agent if provided
			if (options.userAgent) {
				await page.setUserAgent(options.userAgent);
			}

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
			// Create new page if it doesn't exist
			page = await session.browser.newPage();
			session.pages.set(pageId, page);
		}

		return page;
	}

	/**
	 * Create a new page in a session
	 */
	async createPage(sessionId: string, pageId?: string): Promise<string> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		const newPageId = pageId ?? uuid();
		const page = await session.browser.newPage();
		session.pages.set(newPageId, page);

		return newPageId;
	}

	/**
	 * Close a specific page
	 */
	async closePage(sessionId: string, pageId: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		const page = session.pages.get(pageId);
		if (page) {
			await page.close();
			session.pages.delete(pageId);
		}
	}

	/**
	 * Close a browser session
	 */
	async closeSession(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		// Close all pages
		for (const [pageId, page] of session.pages) {
			try {
				await page.close();
			} catch (error) {
				console.error(`Error closing page ${pageId}:`, error);
			}
		}

		// Close browser
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

	/**
	 * Get local storage
	 */
	async getLocalStorage(sessionId: string, pageId: string = 'default'): Promise<unknown> {
		const page = await this.getPage(sessionId, pageId);
		return await page.evaluate(() => {
			const items: Record<string, string> = {};
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key) {
					items[key] = localStorage.getItem(key) ?? '';
				}
			}
			return items;
		});
	}

	/**
	 * Set local storage
	 */
	async setLocalStorage(
		sessionId: string,
		data: Record<string, string>,
		pageId: string = 'default',
	): Promise<void> {
		const page = await this.getPage(sessionId, pageId);
		await page.evaluate((items) => {
			for (const [key, value] of Object.entries(items)) {
				localStorage.setItem(key, value);
			}
		}, data);
	}
}

// Export singleton instance
export const BrowserManager = new BrowserManagerClass();
