import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Human Behavior Network",

  category: "Interactive Systems Visualization & AI-Assisted Product Design",

  heroImg: `${import.meta.env.BASE_URL}human-behavior-network.webp`,

  tagline:
    "An interactive systems-visualization platform that maps relationships among money, data, incentives, and power to explore how complex forces shape human behavior.",

  year: "2026",

  stack: [
    "React 19",
    "TypeScript",
    "TanStack Start",
    "TanStack Router",
    "Zustand",
    "Tailwind CSS",
    "Radix UI",
    "Lucide React",
    "HTML5 Canvas",
    "Vite",
    "Nitro",
    "Playwright",
    "GitHub Actions",
  ],

  features: [
    "Interactive Network Visualization",
    "Custom Canvas Graph Engine",
    "Physics-Based Node Layout",
    "Money / Data / Incentives / Power Layers",
    "Scenario Simulation",
    "Node Inspection",
    "Path & Causality Tracing",
    "Network Stress Testing",
    "PNG Graph Export",
    "JSON System-State Export",
    "Responsive Mobile Interface",
    "Automated GitHub Pages Deployment",
  ],

  impact: [
    "Conceptualized and directed an AI-assisted platform for exploring complex social and economic systems through an interactive network rather than a conventional static information page.",

    "Structured the experience around four primary systemic lenses — money, data, incentives, and power — so users can examine how different drivers interact rather than treating human behavior as an isolated variable.",

    "Directed the creation of a custom HTML5 Canvas visualization engine capable of rendering interactive nodes and relationships with physics-based positioning and graph interactions.",

    "Designed an exploration workflow that allows users to inspect nodes, trace relationships, examine paths, and test how removing network components changes the surrounding system.",

    "Added scenario-oriented controls and system-state interactions so the visualization can be explored as a model rather than only viewed as a diagram.",

    "Included PNG snapshot and JSON system-state export capabilities, making exploratory graph states reusable outside the application.",

    "Used an AI-driven, iterative development workflow to translate product concepts, interaction requirements, and visual ideas into a functioning React and TypeScript application.",

    "Established automated browser verification and production deployment through Playwright and GitHub Actions, with the application published as a public GitHub Pages experience.",

    "Demonstrates the ability to use agentic AI and vibe-coding workflows to move from a conceptual systems model to an interactive, testable, and deployable software product.",
  ],

  links: {
    live: "https://ritik574-coder.github.io/Human_Behavior_Network/",
    repo: "https://github.com/Ritik574-coder/Human_Behavior_Network",
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

export default function HumanBehaviorNetworkDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}