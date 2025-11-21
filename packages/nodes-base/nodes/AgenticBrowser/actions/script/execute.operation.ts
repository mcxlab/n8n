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
		displayName: 'JavaScript Code',
		name: 'script',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		required: true,
		default: '// Your code here\nreturn document.title;',
		description: 'JavaScript code to execute in the browser context',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		default: 'default',
		description: 'The ID of the page to use',
	},
	{
		displayName: 'Arguments (JSON)',
		name: 'args',
		type: 'json',
		default: '[]',
		description: 'Arguments to pass to the script as JSON array',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const script = this.getNodeParameter('script', index) as string;
	const pageId = this.getNodeParameter('pageId', index, 'default') as string;
	const argsJson = this.getNodeParameter('args', index, '[]') as string;

	const page = await BrowserManager.getPage(sessionId, pageId);

	let args: unknown[] = [];
	try {
		args = JSON.parse(argsJson);
	} catch (error) {
		throw new Error(`Invalid JSON in arguments: ${(error as Error).message}`);
	}

	// Execute script in page context
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const result = await page.evaluate(
		// eslint-disable-next-line @typescript-eslint/no-implied-eval
		new Function('...args', script) as (...args: unknown[]) => unknown,
		...args,
	);

	return [
		{
			json: {
				sessionId,
				pageId,
				result,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
