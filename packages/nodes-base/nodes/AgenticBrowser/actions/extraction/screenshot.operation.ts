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
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Full Page',
		name: 'fullPage',
		type: 'boolean',
		default: false,
		description: 'Whether to take a screenshot of the full scrollable page',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{
				name: 'PNG',
				value: 'png',
			},
			{
				name: 'JPEG',
				value: 'jpeg',
			},
		],
		default: 'png',
		description: 'Screenshot image type',
	},
	{
		displayName: 'Quality',
		name: 'quality',
		type: 'number',
		default: 80,
		displayOptions: {
			show: {
				type: ['jpeg'],
			},
		},
		description: 'JPEG quality (0-100)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const fullPage = this.getNodeParameter('fullPage', index, false) as boolean;
	const type = this.getNodeParameter('type', index, 'png') as 'png' | 'jpeg';
	const quality = this.getNodeParameter('quality', index, 80) as number;

	const page = await BrowserManager.getPage(sessionId, pageId);

	const screenshotOptions: Parameters<typeof page.screenshot>[0] = {
		fullPage,
		type,
		encoding: 'base64',
	};

	if (type === 'jpeg') {
		screenshotOptions.quality = quality;
	}

	const screenshot = await page.screenshot(screenshotOptions);

	const binaryData = await this.helpers.prepareBinaryData(
		Buffer.from(screenshot as string, 'base64'),
		`screenshot.${type}`,
		`image/${type}`,
	);

	return [
		{
			json: {
				sessionId,
				pageId,
				success: true,
			},
			binary: {
				screenshot: binaryData,
			},
			pairedItem: { item: index },
		},
	];
}
