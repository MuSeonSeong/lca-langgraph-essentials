// TypeScript type definitions for LangGraph Essentials

import { Annotation } from '@langchain/langgraph';

// L1 State Annotations - using modern LangGraph.js Annotation API
export const StateAnnotation = Annotation.Root({
  nlist: Annotation<string[]>({
    reducer: (left: string[], right: string[]) => [...left, ...right],
    default: () => [],
  }),
});

export type State = typeof StateAnnotation.State;

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

// Common literal types that might be reused
export type NodeDestination = 'b' | 'c' | '__end__';
export type WorkflowDestination = 'human_review' | 'send_reply';

// Graph configuration type
export interface GraphConfig {
  configurable: {
    thread_id: string;
  };
}

// Interrupt response structure
export interface InterruptData {
  [key: string]: any;
}

// Command resume structure
export interface ResumeCommand {
  [key: string]: any;
}