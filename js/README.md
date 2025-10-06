# LangGraph JavaScript/TypeScript Essentials

This directory contains TypeScript implementations of the LangGraph examples from the Python notebooks (L1.ipynb and L2.ipynb). All examples demonstrate the same concepts as the Python versions but leverage TypeScript for type safety and modern JavaScript tooling.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- OpenAI API key (for L2 email workflow)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your API keys

# Build TypeScript
npm run build

# Run basic demo
npm run dev
```

### Environment Setup

Create a `.env` file with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 📚 Examples Overview

### L1: StateGraph Essentials

Learn the fundamental concepts of LangGraph through practical examples:

| Example | File | Concepts |
|---------|------|----------|
| Simple Node | `L1/01-simple-node.ts` | Basic state management, node functions |
| Parallel Execution | `L1/02-parallel-execution.ts` | Parallel edges, state merging |
| Conditional Edges | `L1/03-conditional-edges.ts` | Command-based routing, conditional logic |
| Memory | `L1/04-memory.ts` | State persistence, checkpointers |
| Interrupts | `L1/05-interrupts.ts` | Human-in-the-loop patterns |

### L2: Email Processing Workflow

A complete email processing system demonstrating:

- **Email Classification**: AI-powered intent and urgency detection
- **Parallel Processing**: Document search + bug ticket creation
- **Response Generation**: Context-aware email drafting
- **Human Review**: Interrupt-based approval workflow
- **State Persistence**: Multi-session conversation tracking

## 🎯 Running Examples

### Individual L1 Examples

```bash
# All L1 examples
npm run dev src/L1/index.ts

# Specific examples
npm run dev src/L1/01-simple-node.ts
npm run dev src/L1/02-parallel-execution.ts
npm run dev src/L1/03-conditional-edges.ts --interactive
npm run dev src/L1/04-memory.ts --multi-thread
npm run dev src/L1/05-interrupts.ts --programmatic
```

### L2 Email Workflow

```bash
# Single email processing
npm run dev src/L2/email-workflow.ts

# Batch processing
npm run dev src/L2/email-workflow.ts --batch

# Interactive demo
npm run dev src/L2/email-workflow.ts --interactive
```

### Demo Scripts

```bash
# Basic getting started demo
npm run dev src/examples/basic-usage.ts

# Comprehensive email demo
npm run dev src/examples/email-demo.ts
npm run dev src/examples/email-demo.ts --interactive
```

## 🏗️ Project Structure

```output
js/
├── src/
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── index.ts          # Common utilities
│   │   └── mermaid.ts        # Graph visualization helpers
│   ├── L1/                   # StateGraph essentials
│   │   ├── simple-node.ts
│   │   ├── parallel-execution.ts
│   │   ├── conditional-edges.ts
│   │   ├── memory.ts
│   │   ├── interrupts.ts
│   │   └── index.ts
│   ├── L2/
│   │   └── email-workflow.ts # Complete email processing workflow
│   └── examples/
│       ├── basic-usage.ts    # Getting started demo
│       └── email-demo.ts     # Email workflow demo
├── tests/                    # Test files
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development Scripts

```bash
npm run build      # Compile TypeScript
npm run dev        # Run with langgraph studio 
npm run lint       # Run ESLint
npm run format     # Format with Prettier
npm run typecheck  # TypeScript type checking
npm run test       # Run tests
npm run clean      # Clean build directory
```

## 📖 Learning Path

1. **Start with basics**: Run `npm run dev src/examples/01-basic-usage.ts`
2. **Explore L1 concepts**: Work through each L1 example
3. **Build workflows**: Study the L2 email processing system
4. **Experiment**: Try the interactive modes and modify examples
5. **Build your own**: Use the patterns to create custom workflows

## 🔗 Related Resources

- [LangGraph.js Documentation](https://langchain-ai.github.io/langgraphjs/)
- [LangChain TypeScript](https://js.langchain.com/)
- [Python notebooks](../python/) in this repository
- [Shared assets](../assets/) for images and diagrams