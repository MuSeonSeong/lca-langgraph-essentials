## 🦜
# __LangGraph Essentials__

This course will cover an introduction to key LangGraph concepts: State, Nodes, Edges, Memory, and Interrupts. It consists of five core labs and one cumulative tutorial demonstrating how to build a production-style email support workflow.

## 🚀 Setup 

### Prerequisites

- Ensure you're using Python 3.11 - 3.13.
- This version is required for optimal compatibility with LangGraph.
```bash
python3 --version
```
- [uv](https://docs.astral.sh/uv/) package manager or [pip](https://pypi.org/project/pip/)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Update PATH to use the new uv version
export PATH="/Users/$USER/.local/bin:$PATH"
```

### Installation

1. Clone the repository, cd to python directory:
```bash
git clone https://github.com/langchain-ai/lca-langchainV1-essentials.git
cd ./lca-langchainV1-essentials/python
```

2. Install the package and dependencies:
```bash
# Using uv (this automatically creates and manages the virtual environment)
uv sync

# Using pip (first create the venv)
python3 -m venv .venv
pip install -r requirements.txt
```

3. Copy or rename `.example.env` to create a `.env` file in the project root with your API keys:
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
LANGSMITH_PROJECT=lc-essentials
```

4. Run notebooks or code:
```bash
# Run Jupyter notebooks directly with uv
uv run jupyter lab

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
