"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleNode = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const fontkit_1 = require("fontkit");
class ExampleNode {
    constructor() {
        this.description = {
            displayName: 'Example Node',
            name: 'exampleNode',
            group: ['transform'],
            version: 1,
            description: 'Basic Example Node',
            defaults: {
                name: 'Example Node',
            },
            inputs: ["main"],
            outputs: ["main"],
            usableAsTool: true,
            properties: [
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
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const fontArial = (0, fontkit_1.openSync)('/usr/share/fonts/truetype/msttcorefonts/Arial.ttf');
        let item;
        let input;
        let outputKey;
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                input = this.getNodeParameter('input', itemIndex, '');
                outputKey = this.getNodeParameter('outputKey', itemIndex, '');
                item = items[itemIndex];
                const fontSize = this.getNodeParameter('fontSize', itemIndex, 16);
                if (!input) {
                    item.json[outputKey] = 0;
                    continue;
                }
                const layout = fontArial.layout(input);
                const advanceWidthFUnits = layout.advanceWidth;
                item.json[outputKey] = (advanceWidthFUnits / fontArial.unitsPerEm) * fontSize;
            }
            catch (error) {
                if (this.continueOnFail()) {
                    items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
                }
                else {
                    if (error.context) {
                        error.context.itemIndex = itemIndex;
                        throw error;
                    }
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex,
                    });
                }
            }
        }
        return [items];
    }
}
exports.ExampleNode = ExampleNode;
//# sourceMappingURL=FontKitPixelLength.node.js.map