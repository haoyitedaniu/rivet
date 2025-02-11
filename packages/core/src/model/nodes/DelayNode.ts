import { ChartNode, NodeConnection, NodeId, NodeInputDefinition, NodeOutputDefinition, PortId } from '../NodeBase.js';
import { nanoid } from 'nanoid';
import { NodeImpl, NodeUIData, nodeDefinition } from '../NodeImpl.js';
import { Inputs, Outputs } from '../GraphProcessor.js';
import { EditorDefinition } from '../../index.js';
import { dedent } from 'ts-dedent';

export type DelayNode = ChartNode<'delay', DelayNodeData>;

export type DelayNodeData = {
  delay: number;
};

export class DelayNodeImpl extends NodeImpl<DelayNode> {
  static create(): DelayNode {
    const chartNode: DelayNode = {
      type: 'delay',
      title: 'Delay',
      id: nanoid() as NodeId,
      visualData: {
        x: 0,
        y: 0,
        width: 150,
      },
      data: {
        delay: 0,
      },
    };

    return chartNode;
  }

  getInputDefinitions(connections: NodeConnection[]): NodeInputDefinition[] {
    const inputs: NodeInputDefinition[] = [];
    const inputCount = this.#getInputPortCount(connections);

    for (let i = 1; i <= inputCount; i++) {
      inputs.push({
        dataType: 'any',
        id: `input${i}` as PortId,
        title: `Input ${i}`,
      });
    }

    return inputs;
  }

  getOutputDefinitions(connections: NodeConnection[]): NodeOutputDefinition[] {
    const outputs: NodeOutputDefinition[] = [];
    const inputCount = this.#getInputPortCount(connections);

    for (let i = 1; i <= inputCount - 1; i++) {
      outputs.push({
        dataType: 'any',
        id: `output${i}` as PortId,
        title: `Output ${i}`,
      });
    }

    return outputs;
  }

  static getUIData(): NodeUIData {
    return {
      infoBoxBody: dedent`
        Delays the execution and then passes the input value to the output without any modifications.
      `,
      infoBoxTitle: 'Delay Node',
      contextMenuTitle: 'Delay',
      group: ['Logic'],
    };
  }

  #getInputPortCount(connections: NodeConnection[]): number {
    const inputNodeId = this.chartNode.id;
    const inputConnections = connections.filter(
      (connection) => connection.inputNodeId === inputNodeId && connection.inputId.startsWith('input'),
    );

    let maxInputNumber = 0;
    for (const connection of inputConnections) {
      const messageNumber = parseInt(connection.inputId.replace('input', ''), 10);
      if (messageNumber > maxInputNumber) {
        maxInputNumber = messageNumber;
      }
    }

    return maxInputNumber + 1;
  }

  getEditors(): EditorDefinition<DelayNode>[] {
    return [
      { type: 'number', label: 'Delay (ms)', dataKey: 'delay', defaultValue: 0 },
    ];
  }

  getBody(): string | undefined {
    return `Delay ${this.chartNode.data.delay}ms`;
  }

  async process(inputData: Inputs): Promise<Outputs> {
    await new Promise((resolve) => setTimeout(resolve, this.chartNode.data.delay));

    const inputCount = Object.keys(inputData).filter((key) => key.startsWith('input')).length;

    const outputs: Outputs = {};

    for (let i = 1; i <= inputCount; i++) {
      const input = inputData[`input${i}` as PortId]!;
      outputs[`output${i}` as PortId] = input;
    }

    return outputs;
  }
}

export const delayNode = nodeDefinition(DelayNodeImpl, 'Delay');
