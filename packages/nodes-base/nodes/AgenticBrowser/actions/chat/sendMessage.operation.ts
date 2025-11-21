import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BrowserManager } from '../../BrowserManager';

export const properties: INodeProperties[] = [
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the browser session',
	},
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'options',
		options: [
			{
				name: 'ChatGPT',
				value: 'chatgpt',
			},
			{
				name: 'Claude',
				value: 'claude',
			},
			{
				name: 'Gemini',
				value: 'gemini',
			},
			{
				name: 'Custom',
				value: 'custom',
			},
		],
		default: 'chatgpt',
		description: 'The LLM chat provider',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		description: 'The message to send to the LLM',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Input Selector',
		name: 'inputSelector',
		type: 'string',
		displayOptions: {
			show: {
				provider: ['custom'],
			},
		},
		default: '',
		placeholder: '#prompt-textarea',
		description: 'CSS selector for the chat input field',
	},
	{
		displayName: 'Submit Selector',
		name: 'submitSelector',
		type: 'string',
		displayOptions: {
			show: {
				provider: ['custom'],
			},
		},
		default: '',
		placeholder: 'button[data-testid="send-button"]',
		description: 'CSS selector for the submit button',
	},
	{
		displayName: 'Wait For Response',
		name: 'waitForResponse',
		type: 'boolean',
		default: true,
		description: 'Whether to wait for the LLM response before continuing',
	},
	{
		displayName: 'Response Selector',
		name: 'responseSelector',
		type: 'string',
		displayOptions: {
			show: {
				provider: ['custom'],
				waitForResponse: [true],
			},
		},
		default: '',
		placeholder: '.response-text',
		description: 'CSS selector for the response text',
	},
	{
		displayName: 'Streaming Indicator Selector',
		name: 'streamingSelector',
		type: 'string',
		displayOptions: {
			show: {
				waitForResponse: [true],
			},
		},
		default: '',
		placeholder: '.streaming-indicator',
		description: 'CSS selector for element that appears while streaming (will wait for it to disappear)',
	},
	{
		displayName: 'Timeout (ms)',
		name: 'timeout',
		type: 'number',
		default: 120000,
		description: 'Maximum time to wait for response',
	},
];

// Provider-specific selectors
const PROVIDER_SELECTORS = {
	chatgpt: {
		input: '#prompt-textarea',
		submit: 'button[data-testid="send-button"]',
		response: '[data-message-author-role="assistant"]',
		streaming: 'button[data-testid="stop-button"]',
	},
	claude: {
		input: 'div[contenteditable="true"]',
		submit: 'button[aria-label="Send Message"]',
		response: '.font-claude-message',
		streaming: 'button[aria-label="Stop"]',
	},
	gemini: {
		input: 'rich-textarea',
		submit: 'button[aria-label="Send message"]',
		response: '.model-response-text',
		streaming: '.loading-indicator',
	},
	custom: {
		input: '',
		submit: '',
		response: '',
		streaming: '',
	},
};

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const provider = this.getNodeParameter('provider', index) as keyof typeof PROVIDER_SELECTORS;
	const message = this.getNodeParameter('message', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const waitForResponse = this.getNodeParameter('waitForResponse', index, true) as boolean;
	const timeout = this.getNodeParameter('timeout', index, 120000) as number;

	const page = await BrowserManager.getPage(sessionId, pageId);

	// Get selectors
	let inputSelector: string;
	let submitSelector: string;
	let responseSelector: string;
	let streamingSelector: string;

	if (provider === 'custom') {
		inputSelector = this.getNodeParameter('inputSelector', index) as string;
		submitSelector = this.getNodeParameter('submitSelector', index) as string;
		responseSelector = this.getNodeParameter('responseSelector', index, '') as string;
		streamingSelector = this.getNodeParameter('streamingSelector', index, '') as string;
	} else {
		const selectors = PROVIDER_SELECTORS[provider];
		inputSelector = selectors.input;
		submitSelector = selectors.submit;
		responseSelector = selectors.response;
		streamingSelector = selectors.streaming;
	}

	// Wait for input field
	await page.waitForSelector(inputSelector, { timeout: 30000 });

	// Type message
	await page.click(inputSelector);
	await page.type(inputSelector, message, { delay: 10 });

	// Click submit
	await page.click(submitSelector);

	let response = '';

	if (waitForResponse) {
		// Wait for streaming to complete if streaming selector provided
		if (streamingSelector) {
			try {
				// Wait for streaming indicator to appear
				await page.waitForSelector(streamingSelector, { timeout: 5000 });

				// Wait for it to disappear
				await page.waitForSelector(streamingSelector, { hidden: true, timeout });
			} catch (error) {
				// Streaming indicator might not appear for short responses
				console.log('Streaming indicator not found or disappeared quickly');
			}
		} else {
			// Wait a bit for response to appear
			await page.waitForTimeout(2000);
		}

		// Get response text
		if (responseSelector) {
			// Wait for response element
			await page.waitForSelector(responseSelector, { timeout });

			// Get the latest response (last matching element)
			const responses = await page.$$eval(responseSelector, (elements) =>
				elements.map((el) => el.textContent ?? ''),
			);
			response = responses[responses.length - 1] ?? '';
		}
	}

	return [
		{
			json: {
				sessionId,
				pageId,
				provider,
				message,
				response,
				messageSent: true,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
