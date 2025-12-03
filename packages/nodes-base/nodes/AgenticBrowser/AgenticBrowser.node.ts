import type {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import * as session from './actions/session';
import * as navigation from './actions/navigation';
import * as interaction from './actions/interaction';
import * as extraction from './actions/extraction';
import * as script from './actions/script';
import * as chat from './actions/chat';
import { router } from './actions/router';

export class AgenticBrowser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Agentic Browser',
		name: 'agenticBrowser',
		icon: 'fa:globe',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Automate browser interactions with session persistence and LLM chat support',
		defaults: {
			name: 'Agentic Browser',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Session',
						value: 'session',
						description: 'Manage browser sessions',
					},
					{
						name: 'Navigation',
						value: 'navigation',
						description: 'Navigate pages and wait for elements',
					},
					{
						name: 'Interaction',
						value: 'interaction',
						description: 'Interact with page elements',
					},
					{
						name: 'Extraction',
						value: 'extraction',
						description: 'Extract data from pages',
					},
					{
						name: 'Script',
						value: 'script',
						description: 'Execute custom JavaScript',
					},
					{
						name: 'Chat',
						value: 'chat',
						description: 'Interact with LLM chat interfaces',
					},
				],
				default: 'session',
			},

			// Session operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['session'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new browser session',
						action: 'Create a browser session',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get session information',
						action: 'Get session information',
					},
					{
						name: 'Close',
						value: 'close',
						description: 'Close a browser session',
						action: 'Close a browser session',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all active sessions',
						action: 'List all active sessions',
					},
				],
				default: 'create',
			},

			// Navigation operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['navigation'],
					},
				},
				options: [
					{
						name: 'Go To URL',
						value: 'goto',
						description: 'Navigate to a URL',
						action: 'Navigate to a URL',
					},
					{
						name: 'Wait For Selector',
						value: 'waitForSelector',
						description: 'Wait for an element to appear',
						action: 'Wait for an element to appear',
					},
				],
				default: 'goto',
			},

			// Interaction operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['interaction'],
					},
				},
				options: [
					{
						name: 'Click',
						value: 'click',
						description: 'Click an element',
						action: 'Click an element',
					},
					{
						name: 'Type',
						value: 'type',
						description: 'Type text into an element',
						action: 'Type text into an element',
					},
				],
				default: 'click',
			},

			// Extraction operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['extraction'],
					},
				},
				options: [
					{
						name: 'Get Text',
						value: 'getText',
						description: 'Extract text from page',
						action: 'Extract text from page',
					},
					{
						name: 'Screenshot',
						value: 'screenshot',
						description: 'Take a screenshot',
						action: 'Take a screenshot',
					},
				],
				default: 'getText',
			},

			// Script operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['script'],
					},
				},
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute JavaScript code',
						action: 'Execute JavaScript code',
					},
				],
				default: 'execute',
			},

			// Chat operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Send Message',
						value: 'sendMessage',
						description: 'Send a message to LLM chat',
						action: 'Send a message to LLM chat',
					},
				],
				default: 'sendMessage',
			},

			// Session create properties
			...session.create.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['session'],
						operation: ['create'],
					},
				},
			})),

			// Session get properties
			...session.get.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['session'],
						operation: ['get'],
					},
				},
			})),

			// Session close properties
			...session.close.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['session'],
						operation: ['close'],
					},
				},
			})),

			// Navigation goto properties
			...navigation.goto.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['navigation'],
						operation: ['goto'],
					},
				},
			})),

			// Navigation waitForSelector properties
			...navigation.waitForSelector.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['navigation'],
						operation: ['waitForSelector'],
					},
				},
			})),

			// Interaction click properties
			...interaction.click.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['interaction'],
						operation: ['click'],
					},
				},
			})),

			// Interaction type properties
			...interaction.type.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['interaction'],
						operation: ['type'],
					},
				},
			})),

			// Extraction getText properties
			...extraction.getText.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['extraction'],
						operation: ['getText'],
					},
				},
			})),

			// Extraction screenshot properties
			...extraction.screenshot.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['extraction'],
						operation: ['screenshot'],
					},
				},
			})),

			// Script execute properties
			...script.execute.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['script'],
						operation: ['execute'],
					},
				},
			})),

			// Chat sendMessage properties
			...chat.sendMessage.properties.map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['sendMessage'],
					},
				},
			})),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await router.call(this);
	}
}
