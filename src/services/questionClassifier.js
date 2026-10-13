import { PROJECT_META } from '../data/projectMeta';

export const ANSWER_MODES = Object.freeze({
  PORTFOLIO: 'portfolio',
  GENERAL_TECHNICAL: 'general_technical',
  GREETING: 'greeting',
  UNSUPPORTED: 'unsupported',
});

function detectLanguageLocal(userMessage) {
  const indonesianMarkers = [
    'apa', 'siapa', 'dimana', 'bagaimana', 'gimana', 'kapan',
    'bisa', 'buka', 'lihat', 'tolong', 'kasih', 'tahu',
    'ceritakan', 'jelaskan', 'tentang', 'nya', 'aku', 'kamu',
    'dia', 'saya', 'kalau', 'yang', 'dan', 'atau', 'ini', 'itu',
    'mau', 'ingin', 'dong', 'deh', 'sih', 'aja', 'gak', 'nggak',
  ];
  const words = normalize(userMessage).split(' ');
  const idCount = words.filter((word) => indonesianMarkers.includes(word)).length;
  return idCount >= 1 ? 'id' : 'en';
}

const GREETING_PATTERN = /^(hi|hello|hey|halo|hai|yo|sup|good\s*(morning|afternoon|evening)|selamat\s*(pagi|siang|sore|malam)|assalamualaikum|howdy)\b[!.,\s]*$/i;

const UNSUPPORTED_PATTERNS = [
  /\b(siapa\s+presiden|who\s+is\s+the\s+president|capital\s+of|ibu\s*kota)\b/i,
  /\b(cuaca|weather|berita|news|gosip|gossip)\b/i,
  /\b(translate|terjemahkan|artikan)\b.{0,40}\b(to|into|ke|dari|from)\b/i,
  /\b(write|tulis(?:kan)?|buat(?:kan)?)\s+(me\s+)?(a\s+)?(poem|puisi|song|lagu|essay|cerita|story|resep|recipe)\b/i,
  /\b(resep|recipe|masak(?:an)?|cook(?:ing)?)\b/i,
  /\b(movie|film|musik|music)\s+(recommendation|recom+|rekomendasi|suggest)\b/i,
];

const UNSAFE_PATTERNS = [
  /\b(how\s+to\s+(hack|exploit|phish|make\s+a?\s*bomb)|child\s*porn|csam)\b/i,
];

const PORTFOLIO_PERSONAL_PATTERNS = [
  /\b(your|you'?re|yourself|about\s+you)\b/i,
  /\b(kamu|anda|dirimu|tentang\s+kamu|siapa\s+kamu)\b/i,
  /\britik\b/i,
  /\b(portofolio|portfolio)\b/i,
  /\b(main\s+focus|primary\s+focus|career\s+focus|fokus\s+(utama|karir))\b/i,
  /\b(strongest|best)\s+(skill|skills|strength)\b/i,
  /\b(skill|skills|kemampuan|expertise|capability|capabilities)\b/i,
  /\b(experience|pengalaman|background|bio|introduc)/i,
  /\b(project|projek|proyek|case\s+study)\b/i,
  /\b(technolog(?:y|ies)|tech\s*stack|tools?\s+do\s+you|what\s+do\s+you\s+use|stack\s+yang)\b/i,
  /\b(currently\s+learning|learning\s+direction|sedang\s+belajar)\b/i,
  /\b(contact|email|github|linkedin|hire|available)\b/i,
  /\b(achievement|award|hackathon|credential|certificat)/i,
];

const GENERAL_TECHNICAL_PATTERNS = [
  /\b(what\s+is|what's|whats|apa\s+itu|explain|jelaskan|difference\s+between|vs\.?|versus|how\s+does|how\s+do|define|definition)\b/i,
  /\b(ai|artificial\s+intelligence|machine\s+learning|ml|deep\s+learning|nlp|llm|rag|fine[-\s]?tun(?:e|ing))\b/i,
  /\b(etl|elt|data\s+warehouse|data\s+lake|data\s+engineering|analytics\s+engineering|dbt|snowflake|sql|python|database|postgres|cloud|azure|aws|gcp|medallion|dimensional\s+model)\b/i,
  /\b(pipeline|orchestration|schema|normalization|star\s+schema|olap|oltp|data\s+lake)\b/i,
];

const PROJECT_NAME_PATTERN = new RegExp(
  PROJECT_META.map((project) => escapeRegex(project.slug)).concat(
    PROJECT_META.map((project) => escapeRegex(project.title))
  ).filter(Boolean).join('|') || 'a^',
  'i'
);

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function unsupportedMessage(lang) {
  return lang === 'en'
    ? "I can help with Ritik's portfolio or general technical topics like data engineering, SQL, Python, AI/ML, and cloud. Try one of those!"
    : "Aku bisa bantu soal portofolio Ritik atau topik teknis umum seperti data engineering, SQL, Python, AI/ML, dan cloud. Coba tanya yang itu ya!";
}

function recentModesFromHistory(history = []) {
  const recentUser = history
    .filter((item) => item && item.role === 'user' && typeof item.content === 'string')
    .slice(-2)
    .map((item) => item.content);
  return recentUser;
}

/**
 * Classify a visitor question into an explicit answer mode.
 * Portfolio personal questions win over generic "what is" phrasing.
 */
export function classifyQuestion(userMessage, history = []) {
  const raw = String(userMessage || '').trim();
  const msg = normalize(raw);
  const lang = detectLanguageLocal(raw);

  if (!msg) {
    return { mode: ANSWER_MODES.UNSUPPORTED, lang, rejectionMessage: unsupportedMessage(lang) };
  }

  if (GREETING_PATTERN.test(raw.trim()) || GREETING_PATTERN.test(msg)) {
    return { mode: ANSWER_MODES.GREETING, lang };
  }

  if (UNSAFE_PATTERNS.some((pattern) => pattern.test(raw)) || UNSUPPORTED_PATTERNS.some((pattern) => pattern.test(raw))) {
    return { mode: ANSWER_MODES.UNSUPPORTED, lang, rejectionMessage: unsupportedMessage(lang) };
  }

  const mentionsProject = PROJECT_NAME_PATTERN.test(raw);
  const looksPortfolio = mentionsProject || PORTFOLIO_PERSONAL_PATTERNS.some((pattern) => pattern.test(raw));
  if (looksPortfolio) {
    return { mode: ANSWER_MODES.PORTFOLIO, lang };
  }

  const looksTechnical = GENERAL_TECHNICAL_PATTERNS.some((pattern) => pattern.test(raw));
  if (looksTechnical) {
    return { mode: ANSWER_MODES.GENERAL_TECHNICAL, lang };
  }

  // Follow-ups: inherit mode from recent user turns when the new message is short/ambiguous.
  const prior = recentModesFromHistory(history);
  if (prior.length && msg.split(' ').length <= 12) {
    for (let i = prior.length - 1; i >= 0; i -= 1) {
      const previous = classifyQuestion(prior[i], []);
      if (previous.mode === ANSWER_MODES.GENERAL_TECHNICAL || previous.mode === ANSWER_MODES.PORTFOLIO) {
        return { mode: previous.mode, lang };
      }
    }
  }

  // Default: let the assistant try with portfolio knowledge rather than hard-rejecting.
  return { mode: ANSWER_MODES.PORTFOLIO, lang };
}

/**
 * Back-compat helper used by older call sites.
 * Returns a rejection string only for unsupported/unsafe questions.
 */
export function detectOffTopic(userMessage, lang) {
  const result = classifyQuestion(userMessage);
  if (result.mode !== ANSWER_MODES.UNSUPPORTED) return null;
  if (lang === 'en' || lang === 'id') {
    return unsupportedMessage(lang);
  }
  return result.rejectionMessage;
}
