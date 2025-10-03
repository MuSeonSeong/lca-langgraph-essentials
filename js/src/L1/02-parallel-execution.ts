// L1 Parallel Execution Example - Parallel edges and state merging

import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

const StateAnnotation = Annotation.Root({
  nlist: Annotation<string[]>({
    reducer: (left: string[], right: string[]) => [...left, ...right],
    default: () => [],
  }),
});

type State = typeof StateAnnotation.State;

function nodeA(state: State): Partial<State> {
  console.log(`Adding "A" to`, state.nlist);
  return { nlist: ['A'] };
}

function nodeB(state: State): Partial<State> {
  console.log(`Adding "B" to`, state.nlist);
  return { nlist: ['B'] };
}

function nodeBB(state: State): Partial<State> {
  console.log(`Adding "BB" to`, state.nlist);
  return { nlist: ['BB'] };
}

function nodeC(state: State): Partial<State> {
  console.log(`Adding "C" to`, state.nlist);
  return { nlist: ['C'] };
}

function nodeCC(state: State): Partial<State> {
  console.log(`Adding "CC" to`, state.nlist);
  return { nlist: ['CC'] };
}

function nodeD(state: State): Partial<State> {
  console.log(`Adding "D" to`, state.nlist);
  return { nlist: ['D'] };
}

// Build the parallel execution graph
export function createParallelExecutionGraph() {
  const builder = new StateGraph(StateAnnotation)
    // Add all nodes
    .addNode('a', nodeA)
    .addNode('b', nodeB)
    .addNode('bb', nodeBB)
    .addNode('c', nodeC)
    .addNode('cc', nodeCC)
    .addNode('d', nodeD)
    // Add edges to create parallel execution paths
    .addEdge(START, 'a')
    .addEdge('a', 'b')
    .addEdge('a', 'c')
    .addEdge('b', 'bb')
    .addEdge('c', 'cc')
    .addEdge('bb', 'd')
    .addEdge('cc', 'd')
    .addEdge('d', END);

  return builder.compile();
}

// Example usage function
export async function runParallelExecutionExample(): Promise<void> {
  console.log('\n=== L1: Parallel Execution Example ===\n');

  const graph = createParallelExecutionGraph();

  // Run the graph with initial state
  const initialState: State = {
    nlist: ['Initial String:'],
  };

  console.log('Running graph with initial state:', initialState);
  const result = await graph.invoke(initialState);
  console.log('Final result:', result);

  console.log('\n=== Takeaways ===');
  console.log(
    '- State passed to nodes "bb" and "cc" is the result of both "b" and "c"'
  );
  console.log('- Edges convey control, not data');
  console.log('- Data is stored to state from all active nodes at end of step');
  console.log('- Nodes b and c operate in parallel');
  console.log('- Reducer function merges values returned');
  console.log('- Results from nodes b, c are stored before starting bb and cc');
  console.log('- Control follows edges, not data\n');
}

runParallelExecutionExample().catch(console.error);
