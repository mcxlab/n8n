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
		placeholder: '#submit-button',
		description: 'CSS selector of element to click',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Click Count',
		name: 'clickCount',
		type: 'number',
		default: 1,
		description: 'Number of times to click',
	},
	{
		displayName: 'Delay (ms)',
		name: 'delay',
		type: 'number',
		default: 0,
		description: 'Time to wait between mousedown and mouseup',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const selector = this.getNodeParameter('selector', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const clickCount = this.getNodeParameter('clickCount', index, 1) as number;
	const delay = this.getNodeParameter('delay', index, 0) as number;

	const page = await BrowserManager.getPage(sessionId, pageId);
	await page.click(selector, { clickCount, delay });

	return [
		{
			json: {
				sessionId,
				pageId,
				selector,
				clicked: true,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
