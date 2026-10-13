import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAction, detectLanguage, classifyQuestion, ANSWER_MODES } from './intentRouter.js';

test('existing navigation intents still resolve', () => {
  assert.equal(resolveAction('take me to about').action, 'scroll_to_about');
  assert.equal(resolveAction('go to tech stack').action, 'scroll_to_tech');
});

test('intent router still re-exports classifier modes', () => {
  assert.equal(classifyQuestion('Hi').mode, ANSWER_MODES.GREETING);
  assert.equal(detectLanguage('What is your main focus?'), 'en');
});
