import { PORTFOLIO_DATA } from '../data/portfolioData';
import { PROJECT_DETAILS_DATA } from '../data/projectDetailsData';

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

export function buildScopedContext(userMessage, history = []) {
  const priorQuestions = history
    .filter(message => message.role === 'user')
    .slice(-2)
    .map(message => message.content || '')
    .join(' ');
  const query = normalize(`${priorQuestions} ${userMessage}`);
  const { profile } = PORTFOLIO_DATA;
  const lines = [
    `Name: ${profile.name}`,
    `Primary career focus: Data Engineering. Developing focus: Analytics Engineering. AI/ML is a learning direction and additional skill area, not a professional job title.`,
    `Profile: ${profile.bio}`,
    `Location: ${profile.location}`,
    'Common portfolio questions: introduction and career focus, experience, project descriptions and architecture, project-specific technologies, current learning direction, and public links.',
  ];

  if (/contact|email|github|linkedin|link|social/.test(query)) {
    lines.push(`Public links: Portfolio https://ritik574-coder.github.io/RitikSky_Portfolio/; GitHub ${profile.socials.github}; LinkedIn ${profile.socials.linkedin}; Email ${profile.email}`);
  }

  if (/experience|work|career|employer|role|introduc|who are you|about/.test(query)) {
    lines.push('Portfolio experience:');
    for (const item of PORTFOLIO_DATA.experience) {
      lines.push(`- ${item.title} (${item.period}): ${item.description.join(' ')}`);
    }
  }

  if (/technolog|tech stack|skills|tools|stack/.test(query)) {
    const grouped = {};
    for (const item of PORTFOLIO_DATA.techStack) {
      (grouped[item.category] ||= []).push(item.name);
    }
    lines.push('Listed technologies by portfolio category (project-specific usage is described separately):');
    for (const [category, names] of Object.entries(grouped)) lines.push(`- ${category}: ${names.join(', ')}`);
    if (/project|used|built|implemented/.test(query)) {
      lines.push('Verified technologies used in each project:');
      for (const [slug, project] of Object.entries(PROJECT_DETAILS_DATA)) {
        lines.push(`- ${project.title} (${slug}): ${(project.stack || []).join(', ')}`);
      }
    }
  }

  if (/learn|learning|currently|studying|developing|direction/.test(query)) {
    lines.push('Learning direction: AI/ML and Generative AI; the portfolio lists participation in the PIJAK AI Engineer Cohort. Describe this as learning/cohort work, not an established professional AI engineering role.');
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

  if (/capabilit|what can|expertise/.test(query)) {
    lines.push(`Listed capabilities: ${PORTFOLIO_DATA.capabilities.join(', ')}`);
  }

  lines.push('Answer in the visitor’s language, briefly and in first person. Treat this context as the full set of verified facts. Do not infer metrics, credentials, employers, education, or project usage. If a fact is absent, say it is not listed. Include a relevant provided URL when helpful.');
  return lines.join('\n').slice(0, 10000);
}
