// L1 Conditional Edges Example - Command-based routing
// TypeScript equivalent of the conditional edges example from L1.ipynb

import { StateGraph, START, END, Command } from '@langchain/langgraph';
import type { State, NodeDestination } from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';
import * as readline from 'readline';

// Node functions with conditional routing
function nodeA(state: State): Command<NodeDestination> {
  const select = state.nlist[state.nlist.length - 1]; // Get last element
  let nextNode: NodeDestination;

  if (select === 'b') {
    nextNode = 'b';
  } else if (select === 'c') {
    nextNode = 'c';
  } else if (select === 'q') {
    nextNode = '__end__';
  } else {
    nextNode = '__end__';
  }

  return new Command({
    update: { nlist: [select] },
    goto: nextNode,
  });
}

function nodeB(state: State): Partial<State> {
  return { nlist: ['B'] };
}

function nodeC(state: State): Partial<State> {
  return { nlist: ['C'] };
}

// Build the conditional edges graph
export function createConditionalEdgesGraph() {
  const builder = new StateGraph<State>({
    channels: {
      nlist: {
        reducer: (left: string[], right: string[]) => [...left, ...right],
        default: () => [],
      },
    },
  });

  builder.addNode('a', nodeA);
  builder.addNode('b', nodeB);
  builder.addNode('c', nodeC);

  builder.addEdge(START, 'a');
  builder.addEdge('b', END);
  builder.addEdge('c', END);

  return builder.compile();
}

// Utility function to get user input (Node.js equivalent of Python's input())
function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Example usage function with interactive input
export async function runConditionalEdgesExample(): Promise<void> {
  console.log('\n=== L1: Conditional Edges Example ===\n');

  const graph = createConditionalEdgesGraph();

  // Display graph structure
  const graphDef = `
graph TD
    __start__ --> a
    a -->|"b"| b
    a -->|"c"| c
    a -->|"q"| __end__
    a -->|"other"| __end__
    b --> __end__
    c --> __end__
  `;
  displayGraphInConsole(graphDef, 'Conditional Edges Graph');

  console.log('This example demonstrates conditional routing based on user input.');
  console.log('Enter "b" to go to node B, "c" to go to node C, or "q" to quit.\n');

  // Single example run
  const user = await getUserInput('b, c, or q to quit: ');

  const inputState: State = {
    nlist: [user],
  };

  console.log(`Running graph with input: "${user}"`);
  const result = await graph.invoke(inputState);
  console.log('Result:', result);

  console.log('\n=== Takeaways ===');
  console.log('- Command in return statement updates both state and control path');
  console.log('- Command "goto" allows you to name the next node');
  console.log('- Must be careful to match destination node name');
  console.log('- Return type annotation helps with type checking');
  console.log('- Conditional logic determines the execution path\n');
}

// Interactive loop function (equivalent to Python while loop)
export async function runConditionalEdgesInteractive(): Promise<void> {
  console.log('\n=== L1: Interactive Conditional Edges ===\n');

  const graph = createConditionalEdgesGraph();

  console.log('Interactive mode: Enter "b", "c", or "q" to quit');

  while (true) {
    const user = await getUserInput('b, c, or q to quit: ');

    const inputState: State = {
      nlist: [user],
    };

    const result = await graph.invoke(inputState);
    console.log(result);

    if (result.nlist[result.nlist.length - 1] === 'q') {
      console.log('quit');
      break;
    }
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--interactive')) {
    runConditionalEdgesInteractive().catch(console.error);
  } else {
    runConditionalEdgesExample().catch(console.error);
  }
}