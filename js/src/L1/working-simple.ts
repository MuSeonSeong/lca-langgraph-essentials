// Working L1 Example - Demonstrates that the setup is correct
import { StateGraph, START, END } from '@langchain/langgraph';
import { StateAnnotation, type State } from '../types/index.js';

// Simple working node
function workingNode(state: State): Partial<State> {
  console.log('📝 Processing state:', state.nlist);
  return { nlist: ['✅ LangGraph.js is working!'] };
}

// Create working graph
export async function runWorkingExample(): Promise<void> {
  console.log('🔧 Simple Working Example');
  console.log('=========================\n');

  const graph = new StateGraph(StateAnnotation)
    .addNode('working', workingNode)
    .addEdge(START, 'working')
    .addEdge('working', END)
    .compile();

  const result = await graph.invoke({
    nlist: ['Starting with LangGraph.js'],
  });

  console.log('Result:', result);
  console.log('✅ Success! Your TypeScript LangGraph setup is working correctly.\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWorkingExample().catch(console.error);
}