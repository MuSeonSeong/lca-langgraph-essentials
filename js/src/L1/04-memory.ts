// L1 Memory Example - Checkpointer and state persistence

import {
  StateGraph,
  START,
  END,
  Command,
  MemorySaver,
  Annotation,
} from '@langchain/langgraph';
import { getUserInput } from '../utils/index.js';

const StateAnnotation = Annotation.Root({
  nlist: Annotation<string[]>({
    reducer: (left: string[], right: string[]) => [...left, ...right],
    default: () => [],
  }),
});

type State = typeof StateAnnotation.State;

// Reuse the conditional node logic from previous example
function nodeA(state: State): Command {
  const select = state.nlist[state.nlist.length - 1];
  let nextNode: string;

  if (select === 'b') nextNode = 'b';
  else if (select === 'c') nextNode = 'c';
  else if (select === 'q') nextNode = '__end__';
  else nextNode = '__end__';

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

// Build graph with memory/checkpointer
export function createMemoryGraph() {
  const builder = new StateGraph(StateAnnotation)
    // Add all nodes
    .addNode('a', nodeA)
    .addNode('b', nodeB)
    .addNode('c', nodeC)
    // Add edges to create conditional execution paths
    .addEdge(START, 'a')
    .addEdge('b', END)
    .addEdge('c', END);

  // Compile with checkpointer for persistence
  const memory = new MemorySaver();
  return builder.compile({ checkpointer: memory });
}

// Example usage with memory persistence
export async function runMemoryExample(): Promise<void> {
  console.log('\n=== L1: Memory Example ===\n');

  const graph = createMemoryGraph();

  // Configuration with thread ID for persistence
  const config = {
    configurable: { thread_id: '1' },
  };

  console.log(
    'This example demonstrates state persistence across multiple invocations.'
  );
  console.log('Notice how the state accumulates between runs!\n');

  // Interactive loop with memory
  while (true) {
    const user = await getUserInput('b, c, or q to quit: ');

    const inputState: State = {
      nlist: [user],
    };

    // Invoke with config containing thread_id for persistence
    const result = await graph.invoke(inputState, config);
    console.log(result);

    if (result.nlist[result.nlist.length - 1] === 'q') {
      console.log('quit');
      break;
    }
  }

  console.log('\n=== Takeaways ===');
  console.log('- MemorySaver provides checkpoint memory capability');
  console.log('- Graph compiled with checkpointer parameter');
  console.log('- Invoke graph with thread_id in configuration');
  console.log('- State is preserved between invocations');
  console.log('- Each thread_id maintains separate state\n');
}

// Demonstration of multiple threads
export async function runMultiThreadMemoryExample(): Promise<void> {
  console.log('\n=== L1: Multi-Thread Memory Example ===\n');

  const graph = createMemoryGraph();

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

const args = process.argv.slice(2);
if (args.includes('--multi-thread')) {
  runMultiThreadMemoryExample().catch(console.error);
} else {
  runMemoryExample().catch(console.error);
}
