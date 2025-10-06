// L1 Simple Node Example - Basic state/node functionality

import { StateGraph, START, END } from '@langchain/langgraph';
import { registry } from '@langchain/langgraph/zod';
import z from 'zod';

const StateDefinition = z.object({
  nlist: z.array(z.string()).register(registry, {
    reducer: {
      fn: (left: string[], right: string[]) => [...left, ...right],
    },
    default: () => [],
  }),
});

type State = z.infer<typeof StateDefinition>;

// Define the node function
function nodeA(state: State): Partial<State> {
  console.log(`node a is receiving ${JSON.stringify(state.nlist)}`);
  const note = 'Hello World from Node a';
  console.log(note);
  return { nlist: [note] };
}

// Build the graph
export const graph = new StateGraph(StateDefinition)
  .addNode('a', nodeA)
  .addEdge(START, 'a')
  .addEdge('a', END)
  .compile();

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n=== L1: Simple Node Example ===\n');

  // Run the graph with initial state
  const initialState: State = {
    nlist: ['Hello Node a, how are you?'],
  };

  console.log('Running graph with initial state:', initialState);
  const result = await graph.invoke(initialState);
  console.log('Final result:', result);

  console.log('\n=== Takeaways ===');
  console.log('- State: All nodes can share the same state');
  console.log(
    '- State can be any data type, commonly interfaces in TypeScript'
  );
  console.log('- Nodes are just functions');
  console.log(
    '- Runtime initializes input state and determines which nodes to run'
  );
  console.log(
    '- Node receives state as input and updates state with return value'
  );
  console.log('- Graph returns final value of state\n');
}
