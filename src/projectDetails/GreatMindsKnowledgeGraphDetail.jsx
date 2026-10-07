import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Great Minds Knowledge Graph",

  category: "Research Platform & Knowledge Graph",

  heroImg: `${import.meta.env.BASE_URL}great-minds-knowledge-graph.webp`,

  tagline:
    "An evidence-aware research platform for studying how exceptional people think, decide, fail, adapt, and build through structured knowledge and connected evidence.",

  year: "2026",

  stack: [
    "React 19",
    "TypeScript",
    "Vite",
    "TanStack Router",
    "TanStack Start",
    "Tailwind CSS",
    "Radix UI",
    "Zustand",
    "TanStack Query",
    "Kysely",
    "PostgreSQL",
    "PGlite",
    "Better Auth",
  ],

  features: [
    "Evidence-Aware Knowledge Model",
    "People & Career Timelines",
    "Decision Analysis",
    "Failure & Adaptation Analysis",
    "Knowledge Graph Visualization",
    "Archive Search & Filtering",
    "Source & Provenance Tracking",
    "Person Comparison",
    "Research Data Validation",
    "GitHub Pages Deployment",
  ],

  impact: [
    "Designed the platform around a research-first approach rather than a conventional biography format, separating facts, documented decisions, interpretations, inferences, controversies, and unknowns.",

    "Structured research into connected entities such as people, decisions, failures, experiments, discoveries, technologies, lessons, and sources so relationships can be explored instead of reading each subject as an isolated story.",

    "Created a typed research model that records evidence level, confidence, source references, uncertainty, and decision quality alongside the underlying content.",

    "Provided interactive archive workflows for searching and filtering people and research objects across fields, roles, evidence confidence, and entity types.",

    "Implemented decision analysis that examines context, available information, assumptions, risks, alternatives, execution, outcomes, and the distinction between decision quality and eventual results.",

    "Connected decisions, failures, experiments, breakthroughs, technologies, discoveries, and collaborators into person-level graph relationships that can be explored through the interface.",

    "Added validation logic to detect broken entity references, duplicate slugs, missing sources, and other data-integrity issues within the research catalog.",

    "Created a recruiter-facing example of AI-assisted product creation in which the project concept, information architecture, research framing, and product direction are translated into a functional web platform through iterative AI-supported development.",

    "Configured a reproducible static deployment workflow for GitHub Pages with automated typechecking and build preparation.",
  ],

  links: {
    live: "https://ritik574-coder.github.io/Great-Minds-Knowledge-Graph/",
    repo: "https://github.com/Ritik574-coder/Great-Minds-Knowledge-Graph",
  },

  theme: {
    mode: "dark",
    background: "#070A07",
    surface: "#0D120D",
    surfaceAlt: "#111811",
    border: "#294A1F",
    accent: "#A8FF00",
    accentSoft: "#72D600",
    text: "#F5F7F2",
    textMuted: "#AEB7A8",
    glow: "rgba(168, 255, 0, 0.22)",
  },
};

export default function GreatMindsKnowledgeGraphDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}