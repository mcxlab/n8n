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
		default: '',
		placeholder: '.content',
		description: 'CSS selector to extract text from (leave empty for full page)',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Multiple',
		name: 'multiple',
		type: 'boolean',
		default: false,
		description: 'Whether to extract text from multiple matching elements',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const selector = this.getNodeParameter('selector', index, '') as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const multiple = this.getNodeParameter('multiple', index, false) as boolean;

	const page = await BrowserManager.getPage(sessionId, pageId);

	let text: string | string[];

	if (!selector) {
		// Get full page text
		text = await page.evaluate(() => document.body.innerText);
	} else if (multiple) {
		// Get text from multiple elements
		text = await page.$$eval(selector, (elements) => elements.map((el) => el.textContent ?? ''));
	} else {
		// Get text from single element
		text = await page.$eval(selector, (el) => el.textContent ?? '');
	}

	return [
		{
			json: {
				sessionId,
				pageId,
				selector,
				text,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
