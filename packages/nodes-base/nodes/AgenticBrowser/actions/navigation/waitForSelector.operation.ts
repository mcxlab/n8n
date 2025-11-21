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
		description: 'CSS selector to wait for',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Timeout (ms)',
		name: 'timeout',
		type: 'number',
		default: 30000,
		description: 'Maximum time to wait for selector',
	},
	{
		displayName: 'Visible',
		name: 'visible',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for element to be visible',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const selector = this.getNodeParameter('selector', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const timeout = this.getNodeParameter('timeout', index, 30000) as number;
	const visible = this.getNodeParameter('visible', index, false) as boolean;

	const page = await BrowserManager.getPage(sessionId, pageId);
	await page.waitForSelector(selector, { timeout, visible });

	return [
		{
			json: {
				sessionId,
				pageId,
				selector,
				found: true,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
