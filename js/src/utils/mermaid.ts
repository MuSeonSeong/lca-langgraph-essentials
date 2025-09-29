// Browser-based Mermaid rendering utilities for LangGraph visualizations

import mermaid from 'mermaid';

/**
 * Initialize Mermaid with default configuration
 */
export function initializeMermaid(): void {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
    },
  });
}

/**
 * Render a Mermaid diagram from a graph definition
 */
export async function renderMermaidDiagram(
  graphDefinition: string,
  containerId: string = 'mermaid-container'
): Promise<void> {
  try {
    // Ensure mermaid is initialized
    initializeMermaid();

    // Get or create container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.margin = '20px 0';
      document.body.appendChild(container);
    }

    // Generate unique ID for this diagram
    const diagramId = `diagram-${Date.now()}`;

    // Render the diagram
    const { svg } = await mermaid.render(diagramId, graphDefinition);

    // Insert the SVG into the container
    container.innerHTML = svg;

    console.log('Mermaid diagram rendered successfully');
  } catch (error) {
    console.error('Error rendering Mermaid diagram:', error);

    // Fallback: show the raw graph definition
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">
          <strong>Graph Definition:</strong><br>
          <pre>${graphDefinition}</pre>
        </div>
      `;
    }
  }
}

/**
 * Create a simple HTML page to display a Mermaid diagram
 * Useful for Node.js environments where DOM isn't available
 */
export function createMermaidHTML(
  graphDefinition: string,
  title: string = 'LangGraph Visualization'
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.0/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        #mermaid-container {
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div id="mermaid-container">
        <div class="mermaid">
${graphDefinition}
        </div>
    </div>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
    </script>
</body>
</html>
  `;
}

/**
 * Console-friendly graph display for Node.js environments
 */
export function displayGraphInConsole(
  graphDefinition: string,
  title: string = 'Graph Structure'
): void {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${title.toUpperCase()}`);
  console.log(`${'='.repeat(50)}`);
  console.log(graphDefinition);
  console.log(`${'='.repeat(50)}\n`);
}