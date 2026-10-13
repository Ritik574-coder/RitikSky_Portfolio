import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScopedContext } from './aiContext.js';
import { ANSWER_MODES } from './questionClassifier.js';

test('main focus questions include verified career focus facts', () => {
  const context = buildScopedContext('What is your main focus?', [], ANSWER_MODES.PORTFOLIO);
  assert.match(context, /Primary career focus: Data Engineering/i);
  assert.match(context, /Analytics Engineering/i);
  assert.match(context, /AI\/ML is a learning direction/i);
});

test('technology questions retrieve listed portfolio technologies', () => {
  const context = buildScopedContext('What technologies do you use?', [], ANSWER_MODES.PORTFOLIO);
  assert.match(context, /Listed technologies/i);
  assert.match(context, /Python/);
  assert.match(context, /SQL|PostgreSQL|Database/i);
});

test('strongest-skill questions warn against invented rankings', () => {
  const context = buildScopedContext('What is your strongest skill?', [], ANSWER_MODES.PORTFOLIO);
  assert.match(context, /does not declare a single/);
  assert.match(context, /Primary career focus: Data Engineering/i);
  assert.match(context, /Listed technologies|Listed capabilities/i);
});

test('general technical mode omits portfolio dumps', () => {
  const context = buildScopedContext('Tell me what is AI.', [], ANSWER_MODES.GENERAL_TECHNICAL);
  assert.match(context, /general_technical/);
  assert.doesNotMatch(context, /Verified technologies used in each project/);
  assert.doesNotMatch(context, /Portfolio experience:/);
});

test('unknown achievement questions do not invent awards', () => {
  const context = buildScopedContext('Did you win a Nobel Prize in physics?', [], ANSWER_MODES.PORTFOLIO);
  assert.doesNotMatch(context, /Nobel Prize/);
  assert.match(context, /do not infer|not listed|verified/i);
});
