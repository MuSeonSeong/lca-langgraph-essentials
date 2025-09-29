// Graph visualization utilities
import { writeFileSync } from 'fs';
import { createMermaidHTML } from './mermaid.js';

/**
 * Generate an HTML file with graph visualization
 */
export function generateGraphHTML(
  graphDefinition: string,
  title: string,
  filename: string = 'graph-visualization.html'
): void {
  const html = createMermaidHTML(graphDefinition, title);
  writeFileSync(filename, html);
  console.log(`📊 Graph visualization saved to: ${filename}`);
  console.log(`🌐 Open in browser: file://${process.cwd()}/${filename}`);
}

/**
 * Create a styled graph definition with colors
 */
export function createStyledGraph(
  nodes: Array<{id: string, label: string, type?: 'start'|'end'|'process'|'decision'|'human'}>,
  edges: Array<{from: string, to: string, label?: string}>
): string {
  const nodeDefinitions = nodes.map(node => {
    const label = node.label || node.id;
    return `    ${node.id}[${label}]`;
  }).join('\n');

  const edgeDefinitions = edges.map(edge => {
    if (edge.label) {
      return `    ${edge.from} -->|"${edge.label}"| ${edge.to}`;
    }
    return `    ${edge.from} --> ${edge.to}`;
  }).join('\n');

  const classDefinitions = `
    classDef startEnd fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef human fill:#ffebee,stroke:#c62828,stroke-width:2px

    class ${nodes.filter(n => n.type === 'start' || n.type === 'end').map(n => n.id).join(',')} startEnd
    class ${nodes.filter(n => n.type === 'process').map(n => n.id).join(',')} process
    class ${nodes.filter(n => n.type === 'decision').map(n => n.id).join(',')} decision
    class ${nodes.filter(n => n.type === 'human').map(n => n.id).join(',')} human
  `;

  return `graph TD\n${nodeDefinitions}\n${edgeDefinitions}\n${classDefinitions}`;
}

/**
 * Visualize the simple node example
 */
export function visualizeSimpleNode(): void {
  const nodes = [
    { id: '__start__', label: 'Start', type: 'start' as const },
    { id: 'a', label: 'Node A: Hello World', type: 'process' as const },
    { id: '__end__', label: 'End', type: 'end' as const }
  ];

  const edges = [
    { from: '__start__', to: 'a' },
    { from: 'a', to: '__end__' }
  ];

  const graphDef = createStyledGraph(nodes, edges);
  generateGraphHTML(graphDef, 'L1: Simple Node Graph', 'simple-node-graph.html');
}

/**
 * Visualize the email workflow
 */
export function visualizeEmailWorkflow(): void {
  const nodes = [
    { id: '__start__', label: 'Start', type: 'start' as const },
    { id: 'read', label: 'Read Email', type: 'process' as const },
    { id: 'classify', label: 'Classify Intent', type: 'process' as const },
    { id: 'search', label: 'Search Docs', type: 'process' as const },
    { id: 'bug', label: 'Bug Tracking', type: 'process' as const },
    { id: 'write', label: 'Write Response', type: 'decision' as const },
    { id: 'human', label: 'Human Review', type: 'human' as const },
    { id: 'send', label: 'Send Reply', type: 'process' as const },
    { id: '__end__', label: 'End', type: 'end' as const }
  ];

  const edges = [
    { from: '__start__', to: 'read' },
    { from: 'read', to: 'classify' },
    { from: 'classify', to: 'search' },
    { from: 'classify', to: 'bug' },
    { from: 'search', to: 'write' },
    { from: 'bug', to: 'write' },
    { from: 'write', to: 'human', label: 'Needs Review' },
    { from: 'write', to: 'send', label: 'Auto Send' },
    { from: 'human', to: 'send', label: 'Approved' },
    { from: 'human', to: '__end__', label: 'Rejected' },
    { from: 'send', to: '__end__' }
  ];

  const graphDef = createStyledGraph(nodes, edges);
  generateGraphHTML(graphDef, 'L2: Email Processing Workflow', 'email-workflow-graph.html');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'simple':
      visualizeSimpleNode();
      break;
    case 'email':
      visualizeEmailWorkflow();
      break;
    case 'all':
      visualizeSimpleNode();
      visualizeEmailWorkflow();
      console.log('\n📊 Generated all visualizations!');
      break;
    default:
      console.log('Usage:');
      console.log('npx tsx src/utils/graph-visualizer.ts simple  # Simple node graph');
      console.log('npx tsx src/utils/graph-visualizer.ts email   # Email workflow graph');
      console.log('npx tsx src/utils/graph-visualizer.ts all     # All graphs');
  }
}