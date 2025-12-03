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
		description: 'The ID of the browser session to retrieve',
	},
	{
		displayName: 'Include Cookies',
		name: 'includeCookies',
		type: 'boolean',
		default: false,
		description: 'Whether to include session cookies in the response',
	},
	{
		displayName: 'Include Local Storage',
		name: 'includeLocalStorage',
		type: 'boolean',
		default: false,
		description: 'Whether to include local storage data in the response',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;
	const includeCookies = this.getNodeParameter('includeCookies', index, false) as boolean;
	const includeLocalStorage = this.getNodeParameter('includeLocalStorage', index, false) as boolean;

	const session = BrowserManager.getSession(sessionId);

	if (!session) {
		throw new Error(`Session ${sessionId} not found`);
	}

	const responseData: Record<string, unknown> = {
		sessionId: session.browserId,
		createdAt: session.createdAt,
		pageCount: session.pages.size,
		pageIds: Array.from(session.pages.keys()),
	};

	if (includeCookies) {
		responseData.cookies = await BrowserManager.getSessionCookies(sessionId);
	}

	if (includeLocalStorage) {
		responseData.localStorage = await BrowserManager.getLocalStorage(sessionId);
	}

	return [
		{
			json: responseData,
			pairedItem: { item: index },
		},
	];
}
