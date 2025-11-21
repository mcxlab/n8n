import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BrowserManager } from '../../BrowserManager';

export const properties: INodeProperties[] = [
	{
		displayName: 'Headless Mode',
		name: 'headless',
		type: 'boolean',
		default: true,
		description: 'Whether to run browser in headless mode (without visible UI)',
	},
	{
		displayName: 'User Data Directory',
		name: 'userDataDir',
		type: 'string',
		default: '',
		placeholder: '/path/to/user/data',
		description: 'Directory to store browser profile data (cookies, cache, etc.) for session persistence',
	},
	{
		displayName: 'Window Width',
		name: 'windowWidth',
		type: 'number',
		default: 1920,
		description: 'Browser window width in pixels',
	},
	{
		displayName: 'Window Height',
		name: 'windowHeight',
		type: 'number',
		default: 1080,
		description: 'Browser window height in pixels',
	},
	{
		displayName: 'User Agent',
		name: 'userAgent',
		type: 'string',
		default: '',
		placeholder: 'Mozilla/5.0...',
		description: 'Custom user agent string',
	},
	{
		displayName: 'Proxy Server',
		name: 'proxy',
		type: 'string',
		default: '',
		placeholder: 'http://proxy.example.com:8080',
		description: 'Proxy server URL',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const headless = this.getNodeParameter('headless', index, true) as boolean;
	const userDataDir = this.getNodeParameter('userDataDir', index, '') as string;
	const windowWidth = this.getNodeParameter('windowWidth', index, 1920) as number;
	const windowHeight = this.getNodeParameter('windowHeight', index, 1080) as number;
	const userAgent = this.getNodeParameter('userAgent', index, '') as string;
	const proxy = this.getNodeParameter('proxy', index, '') as string;

	const sessionId = await BrowserManager.createSession({
		headless,
		userDataDir: userDataDir || undefined,
		windowWidth,
		windowHeight,
		userAgent: userAgent || undefined,
		proxy: proxy || undefined,
	});

	return [
		{
			json: {
				sessionId,
				headless,
				windowWidth,
				windowHeight,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
