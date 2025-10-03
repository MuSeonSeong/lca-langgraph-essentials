// L1 Conditional Edges Example - Command-based routing

import {
  StateGraph,
  START,
  END,
  Command,
  Annotation,
} from '@langchain/langgraph';
import * as readline from 'readline';

const StateAnnotation = Annotation.Root({
  nlist: Annotation<string[]>({
    reducer: (left: string[], right: string[]) => [...left, ...right],
    default: () => [],
  }),
});

type State = typeof StateAnnotation.State;

type NodeDestination = 'b' | 'c' | '__end__';

// Node functions with conditional routing
function nodeA(state: State): Command<NodeDestination> {
  const select = state.nlist.at(-1); // Get last element
  let nextNode: NodeDestination;

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

// Build the conditional edges graph
export function createConditionalEdgesGraph() {
  const builder = new StateGraph(StateAnnotation)
    // Add all nodes
    .addNode('a', nodeA)
    .addNode('b', nodeB)
    .addNode('c', nodeC)
    // Add edges to create conditional execution paths
    // (notice how there isn't an edge from 'a' to 'b' or 'c')
    .addEdge(START, 'a')
    .addEdge('b', END)
    .addEdge('c', END);

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

  console.log(
    'This example demonstrates conditional routing based on user input.'
  );
  console.log(
    'Enter "b" to go to node B, "c" to go to node C, or "q" to quit.\n'
  );

  // Single example run
  const user = await getUserInput('b, c, or q to quit: ');

  const inputState: State = {
    nlist: [user],
  };

  console.log(`Running graph with input: "${user}"`);
  const result = await graph.invoke(inputState);
  console.log('Result:', result);

  console.log('\n=== Takeaways ===');
  console.log(
    '- Command in return statement updates both state and control path'
  );
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
