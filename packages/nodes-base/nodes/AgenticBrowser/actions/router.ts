import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { OperationalError } from '@n8n/errors';
import type { AgenticBrowserType } from '../types';

import * as session from './session';
import * as navigation from './navigation';
import * as interaction from './interaction';
import * as extraction from './extraction';
import * as script from './script';
import * as chat from './chat';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const resource = this.getNodeParameter('resource', 0) as AgenticBrowserType;
	const operation = this.getNodeParameter('operation', 0) as string;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: INodeExecutionData[];

			switch (resource) {
				case 'session':
					switch (operation) {
						case 'create':
							result = await session.create.execute.call(this, i);
							break;
						case 'get':
							result = await session.get.execute.call(this, i);
							break;
						case 'close':
							result = await session.close.execute.call(this, i);
							break;
						case 'list':
							result = await session.list.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				case 'navigation':
					switch (operation) {
						case 'goto':
							result = await navigation.goto.execute.call(this, i);
							break;
						case 'waitForSelector':
							result = await navigation.waitForSelector.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				case 'interaction':
					switch (operation) {
						case 'click':
							result = await interaction.click.execute.call(this, i);
							break;
						case 'type':
							result = await interaction.type.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				case 'extraction':
					switch (operation) {
						case 'getText':
							result = await extraction.getText.execute.call(this, i);
							break;
						case 'screenshot':
							result = await extraction.screenshot.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				case 'script':
					switch (operation) {
						case 'execute':
							result = await script.execute.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				case 'chat':
					switch (operation) {
						case 'sendMessage':
							result = await chat.sendMessage.execute.call(this, i);
							break;
						default:
							throw new OperationalError(
								`The operation "${operation}" is not supported for resource "${resource}"`,
							);
					}
					break;

				default:
					throw new OperationalError(`The resource "${resource}" is not supported`);
			}

			returnData.push(...result);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: (error as Error).message,
					},
					pairedItem: { item: i },
				});
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}
