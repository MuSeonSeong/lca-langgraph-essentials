// L2 Email Workflow - Complete email processing workflow

import {
  StateGraph,
  START,
  END,
  Command,
  MemorySaver,
  interrupt,
  Annotation,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { generateId, getUserInput } from '../utils.js';
import z from 'zod';

const llm = new ChatOpenAI({
  model: 'gpt-5',
  temperature: 0,
});

// From L2 - Email classification structure
export interface EmailClassification {
  intent: 'question' | 'bug' | 'billing' | 'feature' | 'complex';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  topic: string;
  summary: string;
}

// L2 Email State Annotation
export const EmailStateAnnotation = Annotation.Root({
  // Raw email data
  email_content: Annotation<string>,
  sender_email: Annotation<string>,
  email_id: Annotation<string>,
  // Classification result
  classification: Annotation<EmailClassification | undefined>,
  // Bug Tracking
  ticket_id: Annotation<string | undefined>,
  // Raw search/API results
  search_results: Annotation<string[] | undefined>,
  customer_history: Annotation<Record<string, any> | undefined>,
  // Generated content
  draft_response: Annotation<string | undefined>,
});

export type EmailAgentState = typeof EmailStateAnnotation.State;

/**
 * Read and process incoming email
 *
 * This node serves as the entry point for the email workflow. In production,
 * this would connect to your email service (e.g., Gmail API, Exchange, IMAP)
 * to fetch email content. Currently, it acts as a pass-through node that logs
 * the sender information.
 *
 * @param state - The current email agent state containing sender_email and email_content
 * @returns Empty partial state (passes through unchanged)
 *
 * @remarks
 * The email_content is expected to be passed in when the graph is initially invoked.
 * This function primarily serves to log the processing start and could be extended
 * to perform email validation, spam filtering, or other preprocessing tasks.
 *
 * @example
 * ```typescript
 * const result = readEmail({
 *   email_content: "Hello, I need help with...",
 *   sender_email: "customer@example.com"
 * });
 * // Logs: "Processing email from: customer@example.com"
 * // Returns: {}
 * ```
 */
function readEmail(state: EmailAgentState): Partial<EmailAgentState> {
  // In production, this would connect to your email service
  // email_content is being passed in when the graph is invoked
  console.log(`Processing email from: ${state.sender_email}`);
  return {}; // Pass through state unchanged
}

/**
 * Classify email intent and urgency using AI
 *
 * Analyzes the email content and sender information to determine:
 * - Intent: The purpose of the email (question, bug, billing, feature, complex)
 * - Urgency: The priority level (low, medium, high, critical)
 * - Topic: The main subject matter
 * - Summary: A brief description of the email content
 *
 * @param state - The current email agent state containing email_content and sender_email
 * @returns Partial state update with classification results, or fallback classification on error
 *
 * @example
 * ```typescript
 * const result = await classifyIntent({
 *   email_content: "Our production system is down!",
 *   sender_email: "customer@example.com"
 * });
 * // Returns: { classification: { intent: 'bug', urgency: 'critical', ... } }
 * ```
 */
async function classifyIntent(
  state: EmailAgentState
): Promise<Partial<EmailAgentState>> {
  console.log('Classifying email intent and urgency...');

  // Create structured LLM that returns EmailClassification
  const structuredLlm = llm.withStructuredOutput(
    z.object({
      intent: z
        .enum(['question', 'bug', 'billing', 'feature', 'complex'])
        .describe('The purpose of the email'),
      urgency: z
        .enum(['low', 'medium', 'high', 'critical'])
        .describe('The priority level'),
      topic: z.string().describe('The main subject matter'),
      summary: z.string().describe('A brief description of the email content'),
    })
  );

  // Format the prompt on-demand
  const classificationPrompt = `
Analyze this customer email and classify it:

Email: ${state.email_content}
From: ${state.sender_email}

Provide classification, including intent, urgency, topic, and summary.
  `;

  try {
    // Get structured response directly as object
    const classification = await structuredLlm.invoke(classificationPrompt);
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
 * Search documentation for relevant information based on email classification
 *
 * Queries the documentation system to find relevant articles, FAQs, and knowledge base
 * entries that can help answer the customer's email. The search is tailored based on
 * the email's classified intent and topic.
 *
 * @param state - The current email agent state containing classification information
 * @returns Partial state update with search_results array, or error message on failure
 *
 * @remarks
 * This is currently a mock implementation that returns simulated search results.
 * In production, this would integrate with your actual search API or documentation
 * system (e.g., Elasticsearch, Algolia, or a vector database).
 *
 * The function uses the classification data (intent and topic) to generate contextually
 * relevant search results. If classification is not available, it falls back to generic
 * search parameters.
 *
 * @example
 * ```typescript
 * const result = await searchDocumentation({
 *   classification: {
 *     intent: 'bug',
 *     topic: 'authentication',
 *     urgency: 'high',
 *     summary: 'Login issues'
 *   }
 * });
 * // Returns: { search_results: ['Documentation for bug: ...', 'FAQ entry: ...', ...] }
 * ```
 */
async function searchDocumentation(
  state: EmailAgentState
): Promise<Partial<EmailAgentState>> {
  console.log('Searching documentation...');

  // Build search query from classification
  const classification = state.classification ?? {
    intent: 'question',
    topic: 'general',
  };

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
 * Create a bug tracking ticket for the email
 *
 * Generates a new bug tracking ticket in the system when an email is classified
 * as a bug report. This function creates a unique ticket ID and would typically
 * integrate with your bug tracking system (e.g., Jira, GitHub Issues, Linear).
 *
 * @param state - The current email agent state containing email details
 * @returns Partial state update with the generated ticket_id
 *
 * @remarks
 * This is currently a mock implementation that generates a ticket ID using the
 * format "BUG_[unique_id]". In production, this would:
 * - Create an actual ticket in your bug tracking system
 * - Include email content, classification, and customer information
 * - Set appropriate priority and labels based on urgency
 * - Link to customer history if available
 * - Return the real ticket ID from the tracking system
 *
 * @example
 * ```typescript
 * const result = await bugTracking({
 *   email_content: "The login button is not working",
 *   classification: { intent: 'bug', urgency: 'high' }
 * });
 * // Returns: { ticket_id: 'BUG_abc123xyz' }
 * // Logs: "Created ticket: BUG_abc123xyz"
 * ```
 */
async function bugTracking(
  state: EmailAgentState
): Promise<Partial<EmailAgentState>> {
  console.log('Creating bug tracking ticket...');

  // Create ticket in your bug tracking system
  const ticketId = `BUG_${generateId()}`;

  console.log(`Created ticket: ${ticketId}`);
  return { ticket_id: ticketId };
}

/**
 * Generate an AI-powered email response draft
 *
 * Creates a contextual response to the customer email using AI, incorporating
 * relevant documentation, customer history, and classification information.
 * Automatically determines if human review is required based on urgency and
 * complexity, then routes to the appropriate next step.
 *
 * @param state - The current email agent state containing email content, classification, search results, and customer history
 * @returns Command object with the draft response and routing decision
 *
 * @remarks
 * The function performs several key operations:
 * - Gathers context from search results and customer history
 * - Constructs a prompt with email content, classification, and context
 * - Generates a response using the LLM
 * - Determines if human review is needed (high/critical urgency or complex intent)
 * - Routes to either 'human_review' or 'send_reply' accordingly
 *
 * Human review is triggered when:
 * - Urgency is 'high' or 'critical'
 * - Intent is classified as 'complex'
 *
 * On error, the function returns a fallback message and routes to human review
 * for safety.
 *
 * @example
 * ```typescript
 * const result = await writeResponse({
 *   email_content: "How do I reset my password?",
 *   classification: { intent: 'question', urgency: 'low' },
 *   search_results: ['Password reset guide: ...'],
 *   customer_history: { tier: 'premium' }
 * });
 * // Returns: Command with draft_response and goto: 'send_reply'
 * ```
 */
async function writeResponse(state: EmailAgentState) {
  console.log('Writing response...');

  const classification = state.classification ?? {
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
      `Customer tier: ${state.customer_history.tier ?? 'standard'}`
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
    const goto = needsReview ? 'human_review' : 'send_reply';

    if (needsReview) console.log('Needs approval');

    return new Command({
      update: { draft_response: response.content },
      goto,
    });
  } catch (error) {
    console.error('Error writing response:', error);
    return new Command({
      update: {
        draft_response: 'Error generating response. Please try again.',
      },
      goto: 'human_review',
    });
  }
}

/**
 * Human review node for email response approval
 *
 * This node pauses the workflow execution to allow a human reviewer to approve,
 * edit, or reject the drafted email response. It uses the interrupt() function
 * to halt execution and wait for human input.
 *
 * @param state - The current email agent state containing the draft response and classification
 * @returns Command object directing the workflow to either send the reply or end
 *
 * @remarks
 * The interrupt() call must come first in the function - any code before it will
 * re-run when the workflow resumes. The human reviewer can:
 * - Approve the draft as-is (routes to 'send_reply')
 * - Edit and approve the draft (routes to 'send_reply' with edited content)
 * - Reject the draft (routes to END, human will handle directly)
 *
 * @example
 * ```typescript
 * // When workflow is paused, human provides decision:
 * const decision = {
 *   approved: true,
 *   edited_response: "Updated response text..."
 * };
 * // Workflow resumes and routes to 'send_reply' with edited response
 * ```
 */
async function humanReview(state: EmailAgentState) {
  const classification = state.classification ?? {
    urgency: 'medium',
    intent: 'question',
  };

  // interrupt() must come first - any code before it will re-run on resume
  const humanDecision = interrupt({
    email_id: state.email_id,
    original_email: state.email_content,
    draft_response: state.draft_response ?? '',
    urgency: classification.urgency,
    intent: classification.intent,
    action: 'Please review and approve/edit this response',
  });

  // Process the human's decision
  if (
    humanDecision &&
    typeof humanDecision === 'object' &&
    'approved' in humanDecision
  ) {
    if (humanDecision.approved) {
      const editedResponse =
        humanDecision.edited_response ?? state.draft_response;
      return new Command({
        update: { draft_response: editedResponse },
        goto: 'send_reply',
      });
    } else {
      // Rejection means human will handle directly
      return new Command({
        update: {},
        goto: END,
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
 * Send the final email response to the customer
 *
 * This node handles the actual sending of the email response. In production,
 * this would integrate with your email service (e.g., Gmail API, SendGrid, SMTP)
 * to deliver the response to the customer. Currently, it logs a preview of the
 * response being sent.
 *
 * @param state - The current email agent state containing draft_response
 * @returns Empty partial state (email sending is a side effect)
 *
 * @remarks
 * This is the final step in the email workflow after the response has been
 * drafted and optionally reviewed by a human. The function expects draft_response
 * to be populated in the state.
 *
 * @example
 * ```typescript
 * const result = await sendReply({
 *   draft_response: "Thank you for contacting us. Here's the solution...",
 *   sender_email: "customer@example.com"
 * });
 * // Logs: "Sending reply: Thank you for contacting us. Here's the solution..."
 * // Returns: {}
 * ```
 */
async function sendReply(
  state: EmailAgentState
): Promise<Partial<EmailAgentState>> {
  // Integrate with email service
  const preview = state.draft_response?.substring(0, 60) + '...';
  console.log(`Sending reply: ${preview}`);

  // In production, you would send the actual email here
  return {};
}

// Build the Email Workflow Graph
export function createEmailWorkflowGraph() {
  const builder = new StateGraph(EmailStateAnnotation)
    // Add nodes - nodes with Command returns need ends arrays
    .addNode('read_email', readEmail)
    .addNode('classify_intent', classifyIntent)
    .addNode('search_documentation', searchDocumentation)
    .addNode('bug_tracking', bugTracking)
    .addNode('write_response', writeResponse)
    .addNode('human_review', humanReview)
    .addNode('send_reply', sendReply)
    // Add edges
    .addEdge(START, 'read_email')
    .addEdge('read_email', 'classify_intent')
    .addEdge('classify_intent', 'search_documentation')
    .addEdge('classify_intent', 'bug_tracking')
    .addEdge('search_documentation', 'write_response')
    .addEdge('bug_tracking', 'write_response')
    .addEdge('send_reply', END);

  // Compile with checkpointer for persistence
  const memory = new MemorySaver();
  return builder.compile({ checkpointer: memory });
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

  // Test with an urgent billing issue
  const initialState: Partial<EmailAgentState> = {
    email_content: 'I was charged twice for my subscription! This is urgent!',
    sender_email: 'customer@example.com',
    email_id: 'email_123',
  };

  const config = {
    configurable: { thread_id: 'customer_123' },
  };

  console.log('Processing email:', initialState.email_content);
  console.log('From:', initialState.sender_email);

  let result = await app.invoke(initialState, config);

  // Handle potential interrupt
  if (hasInterrupt(result)) {
    console.log(
      `\nDraft ready for review: ${result.draft_response?.substring(0, 60)}...\n`
    );

    // Simulate human approval
    result = await app.invoke(
      new Command({ resume: { approved: true } }),
      config
    );
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
    "The tire won't stay on the car!",
    'My subscription is going to end in a few months, what is the new rate?',
  ];

  const needsApproval: any[] = [];

  for (const [i, content] of emailContent.entries()) {
    const initialState: Partial<EmailAgentState> = {
      email_content: content,
      sender_email: 'customer@example.com',
      email_id: `email_${i}`,
    };

    console.log(`${initialState.email_id}: `, '');

    const threadId = generateId();
    const config = {
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

    const config = {
      configurable: { thread_id: pendingEmail.thread_id },
    };

    await app.invoke(
      new Command({
        resume: { approved: true },
      }),
      config
    );
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
    const emailContent = await getUserInput(
      'Enter email content (or "quit" to exit): '
    );

    if (emailContent.toLowerCase() === 'quit') {
      break;
    }

    const senderEmail = await getUserInput('Enter sender email: ');

    const initialState: Partial<EmailAgentState> = {
      email_content: emailContent,
      sender_email: senderEmail,
      email_id: generateId(),
    };

    const config = {
      configurable: { thread_id: generateId() },
    };

    let result = await app.invoke(initialState, config);

    if (hasInterrupt(result)) {
      console.log(`\n${'-'.repeat(50)}`);
      console.log('HUMAN REVIEW REQUIRED');
      console.log(`${'-'.repeat(50)}`);
      console.log('Draft response:', result.draft_response);

      const approval = await getUserInput('Approve this response? (y/n): ');
      const approved =
        approval.toLowerCase() === 'y' || approval.toLowerCase() === 'yes';

      let editedResponse = result.draft_response;
      if (approved && approval.toLowerCase() !== 'y') {
        editedResponse = await getUserInput('Enter edited response: ');
      }

      result = await app.invoke(
        new Command({
          resume: {
            approved,
            edited_response: editedResponse,
          },
        }),
        config
      );
    }

    console.log('\n✅ Email processed successfully!');
  }
}

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
