// L1 Parallel Execution Example - Parallel edges and state merging
// TypeScript equivalent of the parallel execution example from L1.ipynb

import { StateGraph, START, END } from '@langchain/langgraph';
import type { State } from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';

// Node functions - equivalent to the Python functions
function nodeA(state: State): Partial<State> {
  console.log(`Adding "A" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['A'] };
}

function nodeB(state: State): Partial<State> {
  console.log(`Adding "B" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['B'] };
}

function nodeBB(state: State): Partial<State> {
  console.log(`Adding "BB" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['BB'] };
}

function nodeC(state: State): Partial<State> {
  console.log(`Adding "C" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['C'] };
}

function nodeCC(state: State): Partial<State> {
  console.log(`Adding "CC" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['CC'] };
}

function nodeD(state: State): Partial<State> {
  console.log(`Adding "D" to ${JSON.stringify(state.nlist)}`);
  return { nlist: ['D'] };
}

// Build the parallel execution graph
export function createParallelExecutionGraph() {
  const builder = new StateGraph<State>({
    channels: {
      nlist: {
        // Equivalent to Annotated[list[str], operator.add] in Python
        reducer: (left: string[], right: string[]) => [...left, ...right],
        default: () => [],
      },
    },
  });

  // Add all nodes
  builder.addNode('a', nodeA);
  builder.addNode('b', nodeB);
  builder.addNode('bb', nodeBB);
  builder.addNode('c', nodeC);
  builder.addNode('cc', nodeCC);
  builder.addNode('d', nodeD);

  // Add edges to create parallel execution paths
  builder.addEdge(START, 'a');
  builder.addEdge('a', 'b');
  builder.addEdge('a', 'c');
  builder.addEdge('b', 'bb');
  builder.addEdge('c', 'cc');
  builder.addEdge('bb', 'd');
  builder.addEdge('cc', 'd');
  builder.addEdge('d', END);

  return builder.compile();
}

// Example usage function
export async function runParallelExecutionExample(): Promise<void> {
  console.log('\n=== L1: Parallel Execution Example ===\n');

  const graph = createParallelExecutionGraph();

  // Display graph structure
  const graphDef = `
graph TD
    __start__ --> a
    a --> b
    a --> c
    b --> bb
    c --> cc
    bb --> d
    cc --> d
    d --> __end__
  `;
  displayGraphInConsole(graphDef, 'Parallel Execution Graph');

  // Run the graph with initial state
  const initialState: State = {
    nlist: ['Initial String:'],
  };

  console.log('Running graph with initial state:', initialState);
  const result = await graph.invoke(initialState);
  console.log('Final result:', result);

  console.log('\n=== Takeaways ===');
  console.log('- State passed to nodes "bb" and "cc" is the result of both "b" and "c"');
  console.log('- Edges convey control, not data');
  console.log('- Data is stored to state from all active nodes at end of step');
  console.log('- Nodes b and c operate in parallel');
  console.log('- Reducer function merges values returned');
  console.log('- Results from nodes b, c are stored before starting bb and cc');
  console.log('- Control follows edges, not data\n');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runParallelExecutionExample().catch(console.error);
}