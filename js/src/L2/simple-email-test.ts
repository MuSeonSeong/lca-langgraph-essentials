// Simple L2 Test - Basic email workflow without complex APIs
import { StateGraph, START, END, Annotation, Command } from '@langchain/langgraph';

// Simple email state
const EmailState = Annotation.Root({
  email: Annotation<string>,
  classification: Annotation<string>,
  response: Annotation<string>,
});

type State = typeof EmailState.State;

// Simple nodes
function classifyEmail(state: State): Partial<State> {
  console.log('📧 Classifying email:', state.email);
  const classification = state.email.includes('urgent') ? 'urgent' : 'normal';
  return { classification };
}

function writeResponse(state: State): Command<'send' | '__end__'> {
  console.log('✍️ Writing response for:', state.classification, 'email');
  const response = `Thank you for your ${state.classification} email.`;

  const needsReview = state.classification === 'urgent';
  const goto = needsReview ? '__end__' : 'send';

  return new Command({
    update: { response },
    goto,
  });
}

function sendEmail(state: State): Partial<State> {
  console.log('📤 Sending response:', state.response);
  return {};
}

// Simple email workflow test
export async function testSimpleEmailWorkflow(): Promise<void> {
  console.log('📧 Testing Simple Email Workflow');
  console.log('=================================\n');

  const graph = new StateGraph(EmailState)
    .addNode('classify', classifyEmail)
    .addNode('write', writeResponse, {
      ends: ['send', '__end__']
    })
    .addNode('send', sendEmail)
    .addEdge(START, 'classify')
    .addEdge('classify', 'write')
    .addEdge('send', END)
    .compile();

  // Test normal email
  console.log('Test 1: Normal Email');
  const result1 = await graph.invoke({
    email: 'Hello, I have a question about your service.',
    classification: '',
    response: '',
  });
  console.log('Result:', result1);

  console.log('\nTest 2: Urgent Email');
  const result2 = await graph.invoke({
    email: 'This is urgent! My account is locked!',
    classification: '',
    response: '',
  });
  console.log('Result:', result2);

  console.log('\n✅ Simple email workflow test completed!\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSimpleEmailWorkflow().catch(console.error);
}