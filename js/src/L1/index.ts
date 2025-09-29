// L1 Index - LangGraph StateGraph Essentials
// Main entry point for all L1 examples

import { runSimpleNodeExample } from './simple-node.js';
import { runParallelExecutionExample } from './parallel-execution.js';
import { runConditionalEdgesExample, runConditionalEdgesInteractive } from './conditional-edges.js';
import { runMemoryExample, runMultiThreadMemoryExample } from './memory.js';
import { runInterruptExample, runProgrammaticInterruptExample } from './interrupts.js';

// Main function to run all L1 examples
export async function runAllL1Examples(): Promise<void> {
  console.log('🚀 LangGraph: StateGraph Essentials (L1)');
  console.log('==========================================\n');

  try {
    // 1. Basic State and Nodes
    await runSimpleNodeExample();

    // 2. Parallel Execution
    await runParallelExecutionExample();

    // 3. Conditional Edges
    await runConditionalEdgesExample();

    // 4. Memory/Checkpointer
    console.log('Running multi-thread memory example...');
    await runMultiThreadMemoryExample();

    // 5. Interrupts (programmatic version to avoid hanging)
    await runProgrammaticInterruptExample();

    console.log('✅ All L1 examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running L1 examples:', error);
  }
}

// Interactive mode function
export async function runL1Interactive(): Promise<void> {
  console.log('🔄 LangGraph L1 Interactive Mode');
  console.log('=================================\n');

  console.log('Choose an example to run interactively:');
  console.log('1. Conditional Edges (interactive)');
  console.log('2. Memory (interactive)');
  console.log('3. Interrupts (interactive)\n');

  // For demo purposes, just run one interactive example
  console.log('Running interactive conditional edges example...\n');
  await runConditionalEdgesInteractive();
}

// Export individual examples for selective use
export {
  runSimpleNodeExample,
  runParallelExecutionExample,
  runConditionalEdgesExample,
  runConditionalEdgesInteractive,
  runMemoryExample,
  runMultiThreadMemoryExample,
  runInterruptExample,
  runProgrammaticInterruptExample,
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--interactive')) {
    runL1Interactive().catch(console.error);
  } else if (args.includes('--help')) {
    console.log('L1 Examples Usage:');
    console.log('------------------');
    console.log('npm run dev                    # Run all examples');
    console.log('node dist/L1/index.js         # Run all examples');
    console.log('node dist/L1/index.js --interactive  # Interactive mode');
    console.log('');
    console.log('Individual examples:');
    console.log('node dist/L1/simple-node.js');
    console.log('node dist/L1/parallel-execution.js');
    console.log('node dist/L1/conditional-edges.js [--interactive]');
    console.log('node dist/L1/memory.js [--multi-thread]');
    console.log('node dist/L1/interrupts.js [--programmatic]');
  } else {
    runAllL1Examples().catch(console.error);
  }
}