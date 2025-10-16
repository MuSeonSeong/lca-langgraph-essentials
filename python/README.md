## 🦜
# __LangGraph Essentials__

This course will cover an introduction to key LangGraph concepts: State, Nodes, Edges, Memory, and Interrupts. It consists of five core labs and one cumulative tutorial demonstrating how to build a production-style email support workflow.

## 🚀 Quickstart 

### Prerequisites

- Ensure you're using Python 3.11 - 3.13.
- This version is required for optimal compatibility with LangGraph.
```bash
python3 --version
```
- [uv](https://docs.astral.sh/uv/) package manager
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Update PATH to use the new uv version
export PATH="/Users/$USER/.local/bin:$PATH"
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/langchain-ai/lca-langgraphV1-essentials.git
```

1. cd python

3. Install the package and dependencies (this automatically creates and manages the virtual environment):
```bash
uv sync
```

3. Create a `.env` file in the project root with your API keys:
```bash
# Create .env file
cp example.env .env
```

Add your API keys to the `.env` file:
```env

# Required for model usage
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For evaluation and tracing
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=lg_essentials
```

4. Run notebooks or code using uv:
```bash
# Run Jupyter notebooks directly
uv run jupyter notebook

# Or activate the virtual environment if preferred
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
jupyter lab
```

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
Learn to implement structured workflow to process customer emails. This notebook utilizes all of the building blocks from the first notebook in an example application.:
- Task tracking with status management (pending/in_progress/completed)  
