// L1 Interrupts Example - Human-in-the-loop patterns
// TypeScript equivalent of the interrupt example from L1.ipynb

import { StateGraph, START, END, Command, MemorySaver, interrupt } from '@langchain/langgraph';
import type { State, NodeDestination, GraphConfig, InterruptData } from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';
import * as readline from 'readline';

// Node function with interrupt capability
function nodeA(state: State): Command<NodeDestination> {
  console.log("Entered 'a' node");
  const select = state.nlist[state.nlist.length - 1];
  let nextNode: NodeDestination;

  if (select === 'b') {
    nextNode = 'b';
  } else if (select === 'c') {
    nextNode = 'c';
  } else if (select === 'q') {
    nextNode = '__end__';
  } else {
    // Interrupt for unexpected input - equivalent to Python's interrupt()
    const admin = interrupt({
      message: `💥 Unexpected input ${select}! Continue? `,
    });
    console.log('Interrupt response:', admin);

    if (admin === 'continue') {
      nextNode = 'b';
    } else {
      nextNode = '__end__';
      // Update select to 'q' to indicate quit
      return new Command({
        update: { nlist: ['q'] },
        goto: nextNode,
      });
    }
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

// Build graph with interrupts
export function createInterruptGraph() {
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

// Check if result contains an interrupt
function hasInterrupt(result: any): result is { __interrupt__: InterruptData[] } {
  return result && result.__interrupt__ && Array.isArray(result.__interrupt__);
}

// Example usage with interrupt handling
export async function runInterruptExample(): Promise<void> {
  console.log('\n=== L1: Interrupts Example ===\n');

  const graph = createInterruptGraph();
  const config: GraphConfig = { configurable: { thread_id: '1' } };

  // Display graph structure
  const graphDef = `
graph TD
    __start__ --> a
    a -->|"b"| b
    a -->|"c"| c
    a -->|"q"| __end__
    a -->|"unexpected"| interrupt[Interrupt!]
    interrupt -->|"continue"| b
    interrupt -->|"quit"| __end__
    b --> __end__
    c --> __end__

    subgraph "Human-in-the-Loop"
        interrupt
    end
  `;
  displayGraphInConsole(graphDef, 'Interrupt-Enabled Graph');

  console.log('This example demonstrates human-in-the-loop patterns with interrupts.');
  console.log('Try entering unexpected input (not "b", "c", or "q") to trigger an interrupt.\n');

  // Interactive loop with interrupt handling
  while (true) {
    const user = await getUserInput('b, c, or q to quit: ');

    const inputState: State = {
      nlist: [user],
    };

    let result = await graph.invoke(inputState, config);

    // Check if an interrupt occurred
    if (hasInterrupt(result)) {
      console.log(`${'-'.repeat(80)}`);
      console.log('Interrupt:', result);

      const interruptMessage = result.__interrupt__[result.__interrupt__.length - 1];
      const msg = (interruptMessage as any).value?.message || 'Continue?';
      const human = await getUserInput(`\n${msg}: `);

      // Resume with human response
      const humanResponse = new Command({
        resume: human,
      });

      result = await graph.invoke(humanResponse, config);
      console.log(`${'-'.repeat(80)}`);
    }

    console.log(result);

    if (result.nlist[result.nlist.length - 1] === 'q') {
      console.log('quit');
      break;
    }
  }

  console.log('\n=== Takeaways ===');
  console.log('- interrupt() statement pauses operation and returns value in __interrupt__ field');
  console.log('- When graph is invoked with Command containing resume, operation continues');
  console.log('- Node is restarted from the beginning');
  console.log('- Checkpointer replays responses to interrupts');
  console.log('- Enables human oversight and intervention in automated workflows\n');
}

// Demonstration of programmatic interrupt handling
export async function runProgrammaticInterruptExample(): Promise<void> {
  console.log('\n=== L1: Programmatic Interrupt Handling ===\n');

  const graph = createInterruptGraph();
  const config: GraphConfig = { configurable: { thread_id: 'programmatic' } };

  // Test with unexpected input
  const inputState: State = {
    nlist: ['unexpected_input'],
  };

  console.log('Testing with unexpected input:', inputState);
  let result = await graph.invoke(inputState, config);

  if (hasInterrupt(result)) {
    console.log('Interrupt detected!');
    console.log('Interrupt data:', result.__interrupt__);

    // Programmatically respond to interrupt
    console.log('Programmatically responding with "continue"');
    const resumeCommand = new Command({
      resume: 'continue',
    });

    result = await graph.invoke(resumeCommand, config);
    console.log('Final result after resume:', result);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--programmatic')) {
    runProgrammaticInterruptExample().catch(console.error);
  } else {
    runInterruptExample().catch(console.error);
  }
}