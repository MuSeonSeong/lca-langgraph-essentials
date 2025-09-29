// L1 Memory Example - Checkpointer and state persistence
// TypeScript equivalent of the memory example from L1.ipynb

import { StateGraph, START, END, Command, MemorySaver } from '@langchain/langgraph';
import type { State, NodeDestination, GraphConfig } from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';
import * as readline from 'readline';

// Reuse the conditional node logic from previous example
function nodeA(state: State): Command<NodeDestination> {
  const select = state.nlist[state.nlist.length - 1];
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

// Build graph with memory/checkpointer
export function createMemoryGraph() {
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

  // Compile with checkpointer for persistence
  const memory = new MemorySaver();
  return builder.compile({ checkpointer: memory });
}

// Utility function for user input
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

// Example usage with memory persistence
export async function runMemoryExample(): Promise<void> {
  console.log('\n=== L1: Memory Example ===\n');

  const graph = createMemoryGraph();

  // Configuration with thread ID for persistence
  const config: GraphConfig = {
    configurable: { thread_id: '1' },
  };

  // Display graph structure
  const graphDef = `
graph TD
    __start__ --> a
    a -->|"b"| b
    a -->|"c"| c
    a -->|"q"| __end__
    b --> __end__
    c --> __end__

    subgraph "Memory"
        Memory[State persisted between invocations]
    end
  `;
  displayGraphInConsole(graphDef, 'Memory-Enabled Graph');

  console.log('This example demonstrates state persistence across multiple invocations.');
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

  const thread1Config: GraphConfig = { configurable: { thread_id: 'thread-1' } };
  const thread2Config: GraphConfig = { configurable: { thread_id: 'thread-2' } };

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

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--multi-thread')) {
    runMultiThreadMemoryExample().catch(console.error);
  } else {
    runMemoryExample().catch(console.error);
  }
}