import type { Browser, Page } from 'puppeteer';

export interface BrowserSessionData {
	browserId: string;
	browser: Browser;
	pages: Map<string, Page>;
	createdAt: number;
	userDataDir?: string;
}

export interface SessionOptions {
	headless?: boolean;
	userDataDir?: string;
	windowWidth?: number;
	windowHeight?: number;
	userAgent?: string;
	proxy?: string;
}

export interface NavigationOptions {
	sessionId: string;
	pageId?: string;
	url?: string;
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
	timeout?: number;
	selector?: string;
}

export interface InteractionOptions {
	sessionId: string;
	pageId?: string;
	selector: string;
	action: 'click' | 'type' | 'select' | 'scroll' | 'hover' | 'clear';
	value?: string;
	delay?: number;
	clickCount?: number;
}

export interface ExtractionOptions {
	sessionId: string;
	pageId?: string;
	selector?: string;
	attribute?: string;
	multiple?: boolean;
}

export interface ScriptOptions {
	sessionId: string;
	pageId?: string;
	script: string;
	args?: unknown[];
}

export interface ChatOptions {
	sessionId: string;
	pageId?: string;
	provider: 'chatgpt' | 'claude' | 'gemini' | 'custom';
	message: string;
	inputSelector?: string;
	submitSelector?: string;
	responseSelector?: string;
	streamingSelector?: string;
	waitForComplete?: boolean;
	timeout?: number;
}

export type AgenticBrowserType =
	| 'session'
	| 'navigation'
	| 'interaction'
	| 'extraction'
	| 'script'
	| 'chat';

export type SessionOperation = 'create' | 'get' | 'close' | 'list';
export type NavigationOperation = 'goto' | 'reload' | 'back' | 'forward' | 'waitForSelector';
export type InteractionOperation = 'click' | 'type' | 'select' | 'scroll' | 'hover' | 'clear';
export type ExtractionOperation = 'getText' | 'getHtml' | 'getAttribute' | 'screenshot';
export type ScriptOperation = 'execute' | 'evaluate';
export type ChatOperation = 'sendMessage' | 'getResponse' | 'waitForResponse';
