import test from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER_MODES, classifyQuestion, detectOffTopic } from './questionClassifier.js';

test('portfolio questions use verified portfolio mode', () => {
  assert.equal(classifyQuestion('What is your main focus?').mode, ANSWER_MODES.PORTFOLIO);
  assert.equal(classifyQuestion('What technologies do you use?').mode, ANSWER_MODES.PORTFOLIO);
  assert.equal(classifyQuestion('What are your strongest data engineering skills?').mode, ANSWER_MODES.PORTFOLIO);
  assert.equal(classifyQuestion('Tell me about your projects.').mode, ANSWER_MODES.PORTFOLIO);
  assert.equal(classifyQuestion('What is your strongest skill?').mode, ANSWER_MODES.PORTFOLIO);
});

test('general technical questions are not rejected as outside portfolio scope', () => {
  assert.equal(classifyQuestion('Tell me what is AI.').mode, ANSWER_MODES.GENERAL_TECHNICAL);
  assert.equal(classifyQuestion('What is AI?').mode, ANSWER_MODES.GENERAL_TECHNICAL);
  assert.equal(classifyQuestion('Explain ETL versus ELT.').mode, ANSWER_MODES.GENERAL_TECHNICAL);
  assert.equal(classifyQuestion('What is a data warehouse?').mode, ANSWER_MODES.GENERAL_TECHNICAL);
  assert.equal(classifyQuestion('Explain the difference between RAG and fine-tuning.').mode, ANSWER_MODES.GENERAL_TECHNICAL);
  assert.equal(detectOffTopic('Tell me what is AI.', 'en'), null);
  assert.equal(detectOffTopic('What is your main focus?', 'en'), null);
});

test('greetings are classified naturally', () => {
  assert.equal(classifyQuestion('Hi').mode, ANSWER_MODES.GREETING);
  assert.equal(classifyQuestion('hello').mode, ANSWER_MODES.GREETING);
  assert.equal(classifyQuestion('Hey!').mode, ANSWER_MODES.GREETING);
});

test('follow-up technical questions inherit general technical mode from history', () => {
  const history = [
    { role: 'user', content: 'What is a data warehouse?' },
    { role: 'assistant', content: 'A data warehouse is a curated analytical store.' },
  ];
  assert.equal(classifyQuestion('How is that different from a data lake?', history).mode, ANSWER_MODES.GENERAL_TECHNICAL);
});

test('unknown personal achievements do not get a hard off-topic reject', () => {
  const result = classifyQuestion('Did you win a Nobel Prize in physics?');
  assert.equal(result.mode, ANSWER_MODES.PORTFOLIO);
  assert.equal(detectOffTopic('Did you win a Nobel Prize in physics?', 'en'), null);
});

test('genuinely unsupported questions still return a helpful rejection', () => {
  const weather = classifyQuestion('What is the weather in Mumbai today?');
  assert.equal(weather.mode, ANSWER_MODES.UNSUPPORTED);
  assert.match(weather.rejectionMessage, /portfolio|technical/i);
  assert.ok(detectOffTopic('What is the weather in Mumbai today?', 'en'));
});
