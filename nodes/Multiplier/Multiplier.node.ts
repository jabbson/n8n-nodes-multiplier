import type {
	IExecuteFunctions,
	// IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Multiplier implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Multiplier',
		name: 'multiplier',
		group: ['transform'],
		version: 1,
		description: 'Multiplies a number by a given factor',
		icon: 'fa:calculator',
		defaults: {
			name: 'Multiplier',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Multiplier',
				name: 'multiplier',
				type: 'number',
				required: true,
				default: 10,
				placeholder: "1",
				description: 'Multiplier for input number',
			},
			{
				displayName: 'Input Number',
				name: 'inputNumber',
				type: 'number',
				requiresDataPath: 'single',
				required: true,
				default: 1,
				placeholder: "42",
				description: 'Input value from previous node',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;

		let inputNumber: number;
		let multiplier: number;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				inputNumber = this.getNodeParameter('inputNumber', itemIndex, 1) as number;
				multiplier = this.getNodeParameter('multiplier', itemIndex, 1) as number;
				const result = inputNumber * multiplier;

				item = items[itemIndex];

				item.json.multiplicationResult = result;
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
