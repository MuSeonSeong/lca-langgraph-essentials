// L2 Email Workflow - Complete email processing workflow
// TypeScript equivalent of the L2.ipynb email workflow

import { StateGraph, START, END, Command, MemorySaver, interrupt } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import {
  EmailStateAnnotation,
  type EmailAgentState,
  type EmailClassification,
  type GraphConfig,
  type WorkflowDestination
} from '../types/index.js';
import { displayGraphInConsole } from '../utils/mermaid.js';
import { generateId } from '../utils/index.js';
import * as readline from 'readline';

// Initialize LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
});

// Node Functions

/**
 * Extract and parse email content
 */
function readEmail(state: EmailAgentState): Partial<EmailAgentState> {
  // In production, this would connect to your email service
  // email_content is being passed in when the graph is invoked
  console.log(`Processing email from: ${state.sender_email}`);
  return {}; // Pass through state unchanged
}

/**
 * Use LLM to classify email intent and urgency, then route accordingly
 */
async function classifyIntent(state: EmailAgentState): Promise<Partial<EmailAgentState>> {
  console.log('Classifying email intent and urgency...');

  // Create structured LLM that returns EmailClassification
  const structuredLlm = llm.withStructuredOutput({
    name: 'EmailClassification',
    schema: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          enum: ['question', 'bug', 'billing', 'feature', 'complex'],
        },
        urgency: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
        },
        topic: { type: 'string' },
        summary: { type: 'string' },
      },
      required: ['intent', 'urgency', 'topic', 'summary'],
    },
  });

  // Format the prompt on-demand
  const classificationPrompt = `
Analyze this customer email and classify it:

Email: ${state.email_content}
From: ${state.sender_email}

Provide classification, including intent, urgency, topic, and summary.
  `;

  try {
    // Get structured response directly as object
    const classification = await structuredLlm.invoke(classificationPrompt) as EmailClassification;
    console.log('Classification:', classification);

    return { classification };
  } catch (error) {
    console.error('Error classifying email:', error);
    // Fallback classification
    return {
      classification: {
        intent: 'question',
        urgency: 'medium',
        topic: 'general inquiry',
        summary: 'Unable to classify email automatically',
      },
    };
  }
}

/**
 * Search knowledge base for relevant information
 */
async function searchDocumentation(state: EmailAgentState): Promise<Partial<EmailAgentState>> {
  console.log('Searching documentation...');

  // Build search query from classification
  const classification = state.classification || {
    intent: 'question',
    topic: 'general',
  };
  const query = `${classification.intent} ${classification.topic}`;

  try {
    // Mock search results - in production, this would integrate with your search API
    const searchResults = [
      `Documentation for ${classification.intent}: Basic information about ${classification.topic}`,
      `FAQ entry: Common questions related to ${classification.topic}`,
      `Knowledge base article: How to handle ${classification.intent} requests`,
    ];

    console.log('Found search results:', searchResults.length, 'items');
    return { search_results: searchResults };
  } catch (error) {
    console.error('Search error:', error);
    return {
      search_results: [`Search temporarily unavailable: ${error}`],
    };
  }
}

/**
 * Create or update bug tracking ticket
 */
async function bugTracking(state: EmailAgentState): Promise<Partial<EmailAgentState>> {
  console.log('Creating bug tracking ticket...');

  // Create ticket in your bug tracking system
  const ticketId = `BUG_${generateId()}`;

  console.log(`Created ticket: ${ticketId}`);
  return { ticket_id: ticketId };
}

/**
 * Generate response using context and route based on quality
 */
async function writeResponse(state: EmailAgentState): Promise<Command<WorkflowDestination>> {
  console.log('Writing response...');

  const classification = state.classification || {
    intent: 'question',
    urgency: 'medium',
  };

  // Format context from raw state data on-demand
  const contextSections: string[] = [];

  if (state.search_results) {
    const formattedDocs = state.search_results
      .map((doc) => `- ${doc}`)
      .join('\n');
    contextSections.push(`Relevant documentation:\n${formattedDocs}`);
  }

  if (state.customer_history) {
    contextSections.push(
      `Customer tier: ${state.customer_history.tier || 'standard'}`
    );
  }

  // Build the prompt with formatted context
  const draftPrompt = `
Draft a response to this customer email:
${state.email_content}

Email intent: ${classification.intent}
Urgency level: ${classification.urgency}

${contextSections.join('\n\n')}

Guidelines:
- Be professional and helpful
- Address their specific concern
- Use the provided documentation when relevant
- Be brief
  `;

  try {
    const response = await llm.invoke(draftPrompt);

    // Determine if human review is needed based on urgency and intent
    const needsReview =
      classification.urgency === 'high' ||
      classification.urgency === 'critical' ||
      classification.intent === 'complex';

    // Route to the appropriate next node
    const goto: WorkflowDestination = needsReview ? 'human_review' : 'send_reply';

    if (needsReview) {
      console.log('Needs approval');
    }

    return new Command({
      update: { draft_response: response.content },
      goto,
    });
  } catch (error) {
    console.error('Error writing response:', error);
    return new Command({
      update: { draft_response: 'Error generating response. Please try again.' },
      goto: 'human_review',
    });
  }
}

/**
 * Pause for human review using interrupt and route based on decision
 */
async function humanReview(state: EmailAgentState): Promise<Command<WorkflowDestination | '__end__'>> {
  const classification = state.classification || {
    urgency: 'medium',
    intent: 'question',
  };

  // interrupt() must come first - any code before it will re-run on resume
  const humanDecision = interrupt({
    email_id: state.email_id,
    original_email: state.email_content,
    draft_response: state.draft_response || '',
    urgency: classification.urgency,
    intent: classification.intent,
    action: 'Please review and approve/edit this response',
  });

  // Process the human's decision
  if (humanDecision && typeof humanDecision === 'object' && 'approved' in humanDecision) {
    if (humanDecision.approved) {
      const editedResponse =
        (humanDecision as any).edited_response || state.draft_response;
      return new Command({
        update: { draft_response: editedResponse },
        goto: 'send_reply',
      });
    } else {
      // Rejection means human will handle directly
      return new Command({
        update: {},
        goto: '__end__',
      });
    }
  }

  // Default: continue to send reply
  return new Command({
    update: {},
    goto: 'send_reply',
  });
}

/**
 * Send the email response
 */
async function sendReply(state: EmailAgentState): Promise<Partial<EmailAgentState>> {
  // Integrate with email service
  const preview = state.draft_response?.substring(0, 60) + '...';
  console.log(`Sending reply: ${preview}`);

  // In production, you would send the actual email here
  return {};
}

// Build the Email Workflow Graph
export function createEmailWorkflowGraph() {
  const builder = new StateGraph(EmailStateAnnotation);

  // Add nodes - nodes with Command returns need ends arrays
  builder.addNode('read_email', readEmail);
  builder.addNode('classify_intent', classifyIntent);
  builder.addNode('search_documentation', searchDocumentation);
  builder.addNode('bug_tracking', bugTracking);
  builder.addNode('write_response', writeResponse, {
    ends: ['human_review', 'send_reply']
  });
  builder.addNode('human_review', humanReview, {
    ends: ['send_reply', '__end__']
  });
  builder.addNode('send_reply', sendReply);

  // Add edges
  builder.addEdge(START, 'read_email');
  builder.addEdge('read_email', 'classify_intent');
  builder.addEdge('classify_intent', 'search_documentation');
  builder.addEdge('classify_intent', 'bug_tracking');
  builder.addEdge('search_documentation', 'write_response');
  builder.addEdge('bug_tracking', 'write_response');
  builder.addEdge('send_reply', END);

  // Compile with checkpointer for persistence
  const memory = new MemorySaver();
  return builder.compile({ checkpointer: memory });
}

// Utility functions for user interaction
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

function hasInterrupt(result: any): boolean {
  return result && result.__interrupt__ && Array.isArray(result.__interrupt__);
}

// Example Usage Functions

/**
 * Run a single email workflow example
 */
export async function runSingleEmailExample(): Promise<void> {
  console.log('\n=== L2: Email Workflow Example ===\n');

  const app = createEmailWorkflowGraph();

  // Display graph structure
  const graphDef = `
graph TD
    __start__ --> read_email
    read_email --> classify_intent
    classify_intent --> search_documentation
    classify_intent --> bug_tracking
    search_documentation --> write_response
    bug_tracking --> write_response
    write_response -->|needs_review| human_review
    write_response -->|auto_send| send_reply
    human_review -->|approved| send_reply
    human_review -->|rejected| __end__
    send_reply --> __end__

    subgraph "Parallel Processing"
        search_documentation
        bug_tracking
    end

    subgraph "Human-in-the-Loop"
        human_review
    end
  `;
  displayGraphInConsole(graphDef, 'Email Processing Workflow');

  // Test with an urgent billing issue
  const initialState: EmailAgentState = {
    email_content: 'I was charged twice for my subscription! This is urgent!',
    sender_email: 'customer@example.com',
    email_id: 'email_123',
  };

  const config: GraphConfig = {
    configurable: { thread_id: 'customer_123' },
  };

  console.log('Processing email:', initialState.email_content);
  console.log('From:', initialState.sender_email);

  let result = await app.invoke(initialState, config);

  // Handle potential interrupt
  if (hasInterrupt(result)) {
    console.log(`\nDraft ready for review: ${result.draft_response?.substring(0, 60)}...\n`);

    // Simulate human approval
    const humanResponse = new Command({
      resume: { approved: true },
    });

    result = await app.invoke(humanResponse, config);
    console.log('Email sent successfully!');
  }

  console.log('\nFinal state keys:', Object.keys(result));
}

/**
 * Run batch email processing example
 */
export async function runBatchEmailExample(): Promise<void> {
  console.log('\n=== L2: Batch Email Processing ===\n');

  const app = createEmailWorkflowGraph();

  const emailContent = [
    'I was charged two times for my subscription! This is urgent!',
    'I was wondering if this was available in blue?',
    'Can you tell me how long the sale is on?',
    'The tire won\'t stay on the car!',
    'My subscription is going to end in a few months, what is the new rate?',
  ];

  const needsApproval: any[] = [];

  for (const [i, content] of emailContent.entries()) {
    const initialState: EmailAgentState = {
      email_content: content,
      sender_email: 'customer@example.com',
      email_id: `email_${i}`,
    };

    console.log(`${initialState.email_id}: `, '');

    const threadId = generateId();
    const config: GraphConfig = {
      configurable: { thread_id: threadId },
    };

    const result = await app.invoke(initialState, config);

    if (hasInterrupt(result)) {
      console.log('Needs approval');
      needsApproval.push({ ...result, thread_id: threadId });
    } else {
      console.log('Auto-sent');
    }
  }

  console.log(`\n${needsApproval.length} emails need approval`);

  // Process approval queue
  for (const pendingEmail of needsApproval) {
    console.log(`\nApproving ${pendingEmail.email_id}...`);

    const humanResponse = new Command({
      resume: { approved: true },
    });

    const config: GraphConfig = {
      configurable: { thread_id: pendingEmail.thread_id },
    };

    await app.invoke(humanResponse, config);
    console.log('Approved and sent');
  }
}

/**
 * Interactive email workflow demo
 */
export async function runInteractiveEmailDemo(): Promise<void> {
  console.log('\n=== L2: Interactive Email Demo ===\n');

  const app = createEmailWorkflowGraph();

  while (true) {
    console.log('\n--- New Email ---');
    const emailContent = await getUserInput('Enter email content (or "quit" to exit): ');

    if (emailContent.toLowerCase() === 'quit') {
      break;
    }

    const senderEmail = await getUserInput('Enter sender email: ');

    const initialState: EmailAgentState = {
      email_content: emailContent,
      sender_email: senderEmail,
      email_id: generateId(),
    };

    const config: GraphConfig = {
      configurable: { thread_id: generateId() },
    };

    let result = await app.invoke(initialState, config);

    if (hasInterrupt(result)) {
      console.log(`\n${'-'.repeat(50)}`);
      console.log('HUMAN REVIEW REQUIRED');
      console.log(`${'-'.repeat(50)}`);
      console.log('Draft response:', result.draft_response);

      const approval = await getUserInput('Approve this response? (y/n): ');
      const approved = approval.toLowerCase() === 'y' || approval.toLowerCase() === 'yes';

      let editedResponse = result.draft_response;
      if (approved && approval.toLowerCase() !== 'y') {
        editedResponse = await getUserInput('Enter edited response: ');
      }

      const humanResponse = new Command({
        resume: {
          approved,
          edited_response: editedResponse,
        },
      });

      result = await app.invoke(humanResponse, config);
    }

    console.log('\n✅ Email processed successfully!');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--batch')) {
    runBatchEmailExample().catch(console.error);
  } else if (args.includes('--interactive')) {
    runInteractiveEmailDemo().catch(console.error);
  } else {
    runSingleEmailExample().catch(console.error);
  }
}