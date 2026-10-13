import { buildScopedContext } from './aiContext';
import { ANSWER_MODES, classifyQuestion } from './questionClassifier';

const API_BASE_URL = (import.meta.env.VITE_ASSISTANT_API_URL || '').trim().replace(/\/$/, '');

const messagesFromHistory = (messages) => messages
  .filter(message => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
  .slice(-8)
  .map(message => ({ role: message.role, content: message.content.slice(0, 900) }));

export async function getAssistantStatus() {
  if (!API_BASE_URL) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const data = await response.json();
    return data.available === true;
  } catch {
    return false;
  }
}

/**
 * Ask the portfolio assistant.
 * Classifies the latest user question into portfolio / general_technical / greeting
 * so the Worker and scoped context use the correct answer mode.
 */
export async function askPortfolioAssistant(messages, options = {}) {
  if (!API_BASE_URL) {
    const error = new Error('AI is not configured yet. Terminal commands are still available.');
    error.type = 'server';
    throw error;
  }

  const latest = [...messages].reverse().find(message => message.role === 'user')?.content || '';
  const history = messagesFromHistory(messages).slice(0, -1);
  const classification = options.classification || classifyQuestion(latest, history);
  const mode = classification.mode === ANSWER_MODES.UNSUPPORTED
    ? ANSWER_MODES.PORTFOLIO
    : classification.mode;

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: latest.slice(0, 1200),
      history,
      mode,
      context: buildScopedContext(latest, history, mode),
    }),
    signal: AbortSignal.timeout(35000),
  }).catch(() => {
    const error = new Error('The assistant service could not be reached. Please try again shortly.');
    error.type = 'network';
    throw error;
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.answer !== 'string' || !payload.answer.trim()) {
    const error = new Error(
      response.status === 429
        ? 'Too many requests right now. Please wait a moment and try again.'
        : response.status === 503
          ? 'All AI providers are temporarily unavailable. Please try again shortly.'
          : 'The assistant could not answer that just now. Please try again.'
    );
    error.type = response.status === 429 ? 'rate_limit' : 'server';
    throw error;
  }
  return payload.answer.trim().slice(0, 5000);
}
