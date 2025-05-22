"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontKitPixelLength = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const fontkit_1 = require("fontkit");
class FontKitPixelLength {
    constructor() {
        this.description = {
            displayName: 'FontKit Pixel Length',
            name: 'fontKitPixelLength',
            group: ['transform'],
            version: 1,
            description: 'Get the length of a html text in a specific font',
            defaults: {
                name: 'FontKit Pixel Length',
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
    }
    async execute() {
        const items = this.getInputData();
        const fontLocation = this.getNodeParameter('fontLocation', 0, '/usr/share/fonts/truetype/msttcorefonts/Arial.ttf');
        const fontArial = (0, fontkit_1.openSync)(fontLocation);
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
exports.FontKitPixelLength = FontKitPixelLength;
//# sourceMappingURL=FontKitPixelLength.node.js.map