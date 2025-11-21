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
		description: 'The ID of the browser session to close',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessionId = this.getNodeParameter('sessionId', index) as string;

	await BrowserManager.closeSession(sessionId);

	return [
		{
			json: {
				sessionId,
				closed: true,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
