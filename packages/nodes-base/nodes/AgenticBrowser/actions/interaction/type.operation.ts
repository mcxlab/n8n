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
		displayName: 'Selector',
		name: 'selector',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'input[name="username"]',
		description: 'CSS selector of input element',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to type into the element',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Delay (ms)',
		name: 'delay',
		type: 'number',
		default: 0,
		description: 'Delay between key presses in milliseconds',
	},
	{
		displayName: 'Clear First',
		name: 'clearFirst',
		type: 'boolean',
		default: false,
		description: 'Whether to clear the input field before typing',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const selector = this.getNodeParameter('selector', index) as string;
	const text = this.getNodeParameter('text', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const delay = this.getNodeParameter('delay', index, 0) as number;
	const clearFirst = this.getNodeParameter('clearFirst', index, false) as boolean;

	const page = await BrowserManager.getPage(sessionId, pageId);

	if (clearFirst) {
		// Clear existing text using direct value manipulation for better reliability
		await page.evaluate((sel) => {
			const el = document.querySelector(sel);
			if (
				el &&
				(el instanceof HTMLInputElement ||
					el instanceof HTMLTextAreaElement ||
					el instanceof HTMLSelectElement)
			) {
				el.value = '';
			}
		}, selector);
	}

	await page.type(selector, text, { delay });

	return [
		{
			json: {
				sessionId,
				pageId,
				selector,
				text,
				typed: true,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
