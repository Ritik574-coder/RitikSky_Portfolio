import { PORTFOLIO_DATA } from '../data/portfolioData';
import { PROJECT_DETAILS_DATA } from '../data/projectDetailsData';
import { ANSWER_MODES } from './questionClassifier';

const normalize = (text) => (text || '').toLowerCase().trim();

function scoreProject(query, slug, project) {
  const text = `${slug} ${project.title} ${project.category} ${project.tagline} ${(project.stack || []).join(' ')} ${(project.features || []).join(' ')}`.toLowerCase();
  const exactMatch = normalize(slug) && query.includes(normalize(slug));
  const titleMatch = normalize(project.title) && query.includes(normalize(project.title));
  const words = [...new Set(query.split(/[^a-z0-9+#.]+/).filter(word => word.length > 2))];
  return (exactMatch ? 10 : 0) + (titleMatch ? 8 : 0) + words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

function projectContext(slug, project) {
  return [
    `Project: ${project.title} (${slug})`,
    `Category: ${project.category}`,
    `Description: ${project.tagline}`,
    `Year: ${project.year || 'Not listed'}`,
    `Technologies used in this project: ${(project.stack || []).join(', ')}`,
    `Features: ${(project.features || []).slice(0, 6).join('; ')}`,
    `Verified links: ${[project.links?.live && `Live ${project.links.live}`, project.links?.repo && `Repository ${project.links.repo}`].filter(Boolean).join('; ') || 'None listed'}`,
  ].join('\n');
}

function profileFocusLines(profile) {
  return [
    `Name: ${profile.name}`,
    'Preferred public name: Ritik',
    'Primary career focus: Data Engineering.',
    'Developing focus: Analytics Engineering.',
    'AI/ML is a learning direction and additional skill area, not an established professional job title.',
    `Profile: ${profile.bio}`,
    `Listed role label: ${profile.role}`,
    `Location: ${profile.location}`,
  ];
}

function appendTechStack(lines, query) {
  const grouped = {};
  for (const item of PORTFOLIO_DATA.techStack) {
    (grouped[item.category] ||= []).push(item.name);
  }
  lines.push('Listed technologies by portfolio category (project-specific usage is described separately):');
  for (const [category, names] of Object.entries(grouped)) lines.push(`- ${category}: ${names.join(', ')}`);
  if (/project|used|built|implemented|use|pakai|pake/.test(query)) {
    lines.push('Verified technologies used in each project:');
    for (const [slug, project] of Object.entries(PROJECT_DETAILS_DATA)) {
      lines.push(`- ${project.title} (${slug}): ${(project.stack || []).join(', ')}`);
    }
  }
}

/**
 * Build verified portfolio excerpts for portfolio-mode answers.
 * General technical / greeting modes get minimal or no portfolio dumps.
 */
export function buildScopedContext(userMessage, history = [], mode = ANSWER_MODES.PORTFOLIO) {
  if (mode === ANSWER_MODES.GENERAL_TECHNICAL) {
    return [
      'Answer mode: general_technical.',
      'This question is about a general technical topic, not a claim about Ritik unless the user explicitly asks.',
      'Do not invent personal facts about Ritik. Portfolio excerpts are intentionally omitted.',
    ].join('\n');
  }

  if (mode === ANSWER_MODES.GREETING) {
    const { profile } = PORTFOLIO_DATA;
    return [
      'Answer mode: greeting.',
      `You are the portfolio assistant for ${profile.name} (Ritik).`,
      'Primary career focus: Data Engineering. Developing focus: Analytics Engineering. AI/ML is a learning direction.',
      'Greet briefly, offer help with portfolio questions or general technical topics, and do not dump the full bio.',
    ].join('\n');
  }

  const priorQuestions = history
    .filter(message => message.role === 'user')
    .slice(-2)
    .map(message => message.content || '')
    .join(' ');
  const query = normalize(`${priorQuestions} ${userMessage}`);
  const { profile } = PORTFOLIO_DATA;
  const lines = [
    'Answer mode: portfolio.',
    ...profileFocusLines(profile),
    'Common portfolio questions: introduction and career focus, experience, project descriptions and architecture, project-specific technologies, current learning direction, skills/capabilities, and public links.',
    'The portfolio does not declare a single “strongest” skill ranking. When asked about strongest/best skills, state the primary focus (Data Engineering) and summarize listed skills/technologies without inventing rankings, metrics, or credentials.',
  ];

  if (/contact|email|github|linkedin|link|social|hire|available/.test(query)) {
    lines.push(`Public links: Portfolio https://ritik574-coder.github.io/RitikSky_Portfolio/; GitHub ${profile.socials.github}; LinkedIn ${profile.socials.linkedin}; Email ${profile.email}`);
  }

  if (/experience|work|career|employer|role|introduc|who are you|about|focus|background/.test(query)) {
    lines.push('Portfolio experience:');
    for (const item of PORTFOLIO_DATA.experience) {
      lines.push(`- ${item.title} (${item.period}): ${item.description.join(' ')}`);
    }
  }

  if (/technolog|tech stack|skills?|tools|stack|strongest|best skill|capability|capabilities|expertise|use|pakai|pake/.test(query)) {
    appendTechStack(lines, query);
    lines.push(`Listed capabilities: ${PORTFOLIO_DATA.capabilities.join(', ')}`);
  }

  if (/learn|learning|currently|studying|developing|direction/.test(query)) {
    lines.push('Learning direction: AI/ML and Generative AI; the portfolio lists participation in the PIJAK AI Engineer Cohort. Describe this as learning/cohort work, not an established professional AI engineering role.');
  }

  if (/achievement|award|hackathon|credential|certificat/.test(query)) {
    if (PORTFOLIO_DATA.achievements?.length) {
      lines.push('Verified achievements listed in the portfolio:');
      for (const item of PORTFOLIO_DATA.achievements) {
        lines.push(`- ${item.title}${item.project ? ` (${item.project})` : ''}: ${item.description}`);
      }
    } else {
      lines.push('No additional achievements are listed beyond what appears elsewhere in these excerpts.');
    }
  }

  const projectMatches = Object.entries(PROJECT_DETAILS_DATA)
    .map(([slug, project]) => ({ slug, project, score: scoreProject(query, slug, project) }))
    .sort((a, b) => b.score - a.score);
  const explicitProjectQuery = /project|architecture|warehouse|retail|snowflake|dbt|skynova|dashboard|knowledge graph|medallion|links/.test(query);
  const matchedProjects = projectMatches.filter(item => item.score >= 2).slice(0, 2);
  if (matchedProjects.length) {
    lines.push('Relevant verified project details:');
    lines.push(...matchedProjects.map(({ slug, project }) => projectContext(slug, project)));
  } else if (explicitProjectQuery) {
    lines.push('Portfolio project index:');
    for (const [slug, project] of Object.entries(PROJECT_DETAILS_DATA)) {
      lines.push(`- ${project.title} (${slug}): ${project.category}; repository ${project.links?.repo || 'not listed'}${project.links?.live ? `; live ${project.links.live}` : ''}`);
    }
  }

  if (/capabilit|what can|expertise/.test(query) && !/technolog|tech stack|skills?|tools|stack|strongest|best skill/.test(query)) {
    lines.push(`Listed capabilities: ${PORTFOLIO_DATA.capabilities.join(', ')}`);
  }

  lines.push('Treat this context as the full set of verified personal facts. Do not infer metrics, credentials, employers, education, or project usage beyond what is written here. If a requested personal fact is absent, say it is not listed.');
  return lines.join('\n').slice(0, 10000);
}
