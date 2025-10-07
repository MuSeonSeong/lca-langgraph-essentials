// L1 Memory Example - Checkpointer and state persistence

import {
  StateGraph,
  START,
  END,
  Command,
  MemorySaver,
} from '@langchain/langgraph';
import { registry } from '@langchain/langgraph/zod';
import z from 'zod';

const StateDefinition = z.object({
  nlist: z.array(z.string()).register(registry, {
    reducer: {
      fn: (left: string[], right: string[]) => left.concat(right),
    },
    default: () => [],
  }),
});

type State = z.infer<typeof StateDefinition>;

// Reuse the conditional node logic from previous example
function nodeA(state: State): Command {
  const select = state.nlist[state.nlist.length - 1];
  let nextNode: string;

  if (select === 'b') nextNode = 'b';
  else if (select === 'c') nextNode = 'c';
  else if (select === 'q') nextNode = END;
  else nextNode = END;

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

// Define the checkpointer to use for persistence
const memory = new MemorySaver();

// Build graph with memory/checkpointer
export const graph = new StateGraph(StateDefinition)
  // Add all nodes
  .addNode('a', nodeA, { ends: ['b', 'c'] })
  .addNode('b', nodeB)
  .addNode('c', nodeC)
  // Add edges to create conditional execution paths
  .addEdge(START, 'a')
  .addEdge('b', END)
  .addEdge('c', END)
  // Compile with checkpointer for persistence
  .compile({ checkpointer: memory });

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n=== L1: Multi-Thread Memory Example ===\n');

  const thread1Config = {
    configurable: { thread_id: 'thread-1' },
  };
  const thread2Config = {
    configurable: { thread_id: 'thread-2' },
  };

  // Run some operations on thread 1
  console.log('=== Thread 1 Operations ===');
  let result1 = await graph.invoke({ nlist: ['b'] }, thread1Config);
  console.log('Thread 1 after "b":', result1);

  result1 = await graph.invoke({ nlist: ['c'] }, thread1Config);
  console.log('Thread 1 after "c":', result1);

  // Run some operations on thread 2
  console.log('\n=== Thread 2 Operations ===');
  let result2 = await graph.invoke({ nlist: ['c'] }, thread2Config);
  console.log('Thread 2 after "c":', result2);

  result2 = await graph.invoke({ nlist: ['b'] }, thread2Config);
  console.log('Thread 2 after "b":', result2);

  // Show that threads maintain separate state
  console.log('\n=== Final States ===');
  const finalResult1 = await graph.invoke({ nlist: ['q'] }, thread1Config);
  console.log('Thread 1 final state:', finalResult1);

  const finalResult2 = await graph.invoke({ nlist: ['q'] }, thread2Config);
  console.log('Thread 2 final state:', finalResult2);

  console.log('\nNotice how each thread maintains its own separate state!');
}
