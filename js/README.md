# LangGraph JavaScript/TypeScript Essentials

This directory contains TypeScript implementations of the LangGraph examples from the Python notebooks (L1.ipynb and L2.ipynb). All examples demonstrate the same concepts as the Python versions but leverage TypeScript for type safety and modern JavaScript tooling.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- OpenAI API key (for L2 email workflow)

### Installation

Download the course repository

```bash
# Clone the repo, cd to 'python' directory
git clone https://github.com/langchain-ai/lca-langgraph-essentials.git
cd ./lca-langgraph-essentials/js
```

Make a copy of example.env

```bash
# Create .env file
cp example.env .env
```

Insert API keys directly into .env file, OpenAI (required) and [LangSmith](#getting-started-with-langsmith) (optional)

```bash
# Add OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Optional API key for LangSmith tracing
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=langgraph-py-essentials
```

build project

```bash
# Install dependencies
pnpm install
```


### Getting Started with LangSmith

- Create a [LangSmith](https://smith.langchain.com/) account
- Create a LangSmith API key
<img width="1196" height="693" alt="Screenshot 2025-10-16 at 8 28 03 AM" src="https://github.com/user-attachments/assets/e39b8364-c3e3-4c75-a287-d9d4685caad5" />
<img width="1196" height="468" alt="Screenshot 2025-10-16 at 8 29 57 AM" src="https://github.com/user-attachments/assets/2e916b2d-e3b0-4c59-a178-c5818604b8fe" />



## 📚 Tutorial Overview

This repository contains notebooks for Labs 1-5, and an additional notebook showcasing an end-to-end email agent. These labs cover the foundations of LangGraph that will enable you to build any workflow or agent.

### `L1-5.ipynb` - LangGraph Essentials
- You will use all the components of LangGraph
    - State and Nodes
    - Edges
        - Parallel
        - Conditional
    - Memory
    - Interrupts/ Human-In-The-Loop  

### `EmailAgent.ipynb` - Build A Workflow
Learn to implement a structured workflow to process customer emails. This lab utilizes all of the building blocks from the first labs in an example application.:
- Task tracking with status management (pending/in_progress/completed)  



## 🎯 Running Examples

### Individual L1 Examples

```bash
pnpm tsx src/L1/01-simple-node.ts
pnpm tsx src/L1/02-parallel-execution.ts
pnpm tsx src/L1/03-conditional-edges.ts 
pnpm tsx src/L1/03-conditional-edge-router.td
pnpm tsx src/L1/04-memory.ts
pnpm tsx src/L1/05-interrupts.ts 
```
### 📧 L2 Email Workflow

```bash
# email processing in Langsmith Studio
pnpm dev
```

## 🔗 Related Resources

- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
