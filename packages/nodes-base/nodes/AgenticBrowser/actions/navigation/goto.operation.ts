import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BrowserManager } from '../../BrowserManager';

export const properties: INodeProperties[] = [
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
		description: 'The ID of the browser session',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com',
		description: 'The URL to navigate to',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use (default uses the first page)',
	},
	{
		displayName: 'Wait Until',
		name: 'waitUntil',
		type: 'options',
		options: [
			{
				name: 'Load',
				value: 'load',
				description: 'Wait for the load event',
			},
			{
				name: 'DOM Content Loaded',
				value: 'domcontentloaded',
				description: 'Wait for DOMContentLoaded event',
			},
			{
				name: 'Network Idle (0)',
				value: 'networkidle0',
				description: 'Wait until there are no more than 0 network connections',
			},
			{
				name: 'Network Idle (2)',
				value: 'networkidle2',
				description: 'Wait until there are no more than 2 network connections',
			},
		],
		default: 'load',
		description: 'When to consider navigation succeeded',
	},
	{
		displayName: 'Timeout (ms)',
		name: 'timeout',
		type: 'number',
		default: 30000,
		description: 'Maximum navigation time in milliseconds',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const url = this.getNodeParameter('url', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const waitUntil = this.getNodeParameter('waitUntil', index, 'load') as
		| 'load'
		| 'domcontentloaded'
		| 'networkidle0'
		| 'networkidle2';
	const timeout = this.getNodeParameter('timeout', index, 30000) as number;

	const page = await BrowserManager.getPage(sessionId, pageId);
	const response = await page.goto(url, { waitUntil, timeout });

	return [
		{
			json: {
				sessionId,
				pageId,
				url,
				status: response?.status(),
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
