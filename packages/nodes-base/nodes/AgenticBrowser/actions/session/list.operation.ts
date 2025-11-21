import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BrowserManager } from '../../BrowserManager';

export const properties: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const sessions = BrowserManager.listSessions();

	return [
		{
			json: {
				sessions,
				count: sessions.length,
			},
			pairedItem: { item: index },
		},
	];
}
