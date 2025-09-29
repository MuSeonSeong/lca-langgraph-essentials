// L1 Simple Node Example - Basic state/node functionality
// TypeScript equivalent of the first example from L1.ipynb

import { StateGraph, START, END } from '@langchain/langgraph';
import { StateAnnotation, type State } from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';

// Define the node function - equivalent to node_a in Python
function nodeA(state: State): Partial<State> {
  console.log(`node a is receiving ${JSON.stringify(state.nlist)}`);
  const note = 'Hello World from Node a';
  console.log(note);
  return { nlist: [note] };
}

// Build the graph - equivalent to the Python graph building
export function createSimpleNodeGraph() {
  const builder = new StateGraph(StateAnnotation)
    .addNode('a', nodeA)
    .addEdge(START, 'a')
    .addEdge('a', END);

  return builder.compile();
}

// Example usage function
export async function runSimpleNodeExample(): Promise<void> {
  console.log('\n=== L1: Simple Node Example ===\n');

  const graph = createSimpleNodeGraph();

  // Display graph structure (console version of mermaid)
  const graphDef = `
graph TD
    __start__ --> a
    a --> __end__
  `;
  displayGraphInConsole(graphDef, 'Simple Node Graph');

  // Run the graph with initial state
  const initialState: State = {
    nlist: ['Hello Node a, how are you?'],
  };

  console.log('Running graph with initial state:', initialState);
  const result = await graph.invoke(initialState);
  console.log('Final result:', result);

  console.log('\n=== Takeaways ===');
  console.log('- State: All nodes can share the same state');
  console.log('- State can be any data type, commonly interfaces in TypeScript');
  console.log('- Nodes are just functions');
  console.log('- Runtime initializes input state and determines which nodes to run');
  console.log('- Node receives state as input and updates state with return value');
  console.log('- Graph returns final value of state\n');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleNodeExample().catch(console.error);
}