import type {IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription,} from 'n8n-workflow';
import {NodeConnectionType, NodeOperationError} from 'n8n-workflow';
import {Font, openSync} from 'fontkit';

export class FontKitPixelLength implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FontKit Pixel Length',
		name: 'fontKitPixelLength',
		group: ['transform'],
		version: 1,
		description: 'Get the length of a html text in a specific font',
		defaults: {
			name: 'FontKit Pixel Length',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Input String',
				name: 'input',
				type: 'string',
				default: '',
				placeholder: 'Example Text',
				description: 'Example text input for pixel measurement',
			},
			{
				displayName: 'Output Key',
				name: 'outputKey',
				type: 'string',
				default: 'output',
				placeholder: 'output_key',
				description: 'The output key',
			},
			{
				displayName: 'Font Size',
				name: 'fontSize',
				type: 'number',
				default: 16,
			},
			{
				displayName: 'Font Location',
				name: 'fontLocation',
				type: 'string',
				default: '/usr/share/fonts/truetype/msttcorefonts/Arial.ttf',
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const fontLocation = this.getNodeParameter('fontLocation', 0, '/usr/share/fonts/truetype/msttcorefonts/Arial.ttf') as string;
		const fontArial: Font = openSync(fontLocation) as Font;

		let item: INodeExecutionData;
		let input: string;
		let outputKey: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				input = this.getNodeParameter('input', itemIndex, '') as string;
				outputKey = this.getNodeParameter('outputKey', itemIndex, '') as string;
				item = items[itemIndex];
				const fontSize = this.getNodeParameter('fontSize', itemIndex, 16) as number;

				if (!input) {
					item.json[outputKey] = 0;
					continue;
				}

				const layout = fontArial.layout(input);
				const advanceWidthFUnits = layout.advanceWidth;

				item.json[outputKey] = (advanceWidthFUnits / fontArial.unitsPerEm) * fontSize;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex});
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
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
