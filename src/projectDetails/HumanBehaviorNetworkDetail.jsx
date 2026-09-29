import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Human Behavior Network",
  category: "AI / Fintech",
  heroImg: `${import.meta.env.BASE_URL}human-behavior-network.webp`,
  tagline:
    "A personal AI-powered financial assistant on Telegram that automatically tracks expenses & income using RAG technology and OCR.",
  year: "2026",
  stack: [
    "Python (aiogram)",
    "Supabase (PostgreSQL + pgvector)",
    "RAG (Retrieval-Augmented Generation)",
    "LLM (Cerebras / OpenAI)",
    "Docker & Render",
    "Sentence Transformers",
  ],
  features: [
    "Natural language input (text/voice) for instant transaction logging without complicated manual forms.",
    "Advanced RAG Engine that learns user spending patterns for automatic category classification.",
    "Double-entry Ledger system (Bank Core) to ensure balance accuracy and real-time budget tracking.",
    "OCR integration to scan shopping receipts and automatically convert them into transaction data.",
    "Smart clarification mechanism using interactive buttons when input is ambiguous or incomplete.",
    "Periodic financial reports (daily/weekly/monthly) plus AI-based insights for savings recommendations.",
  ],
  impact: [
    "Transforms boring manual financial record-keeping into natural and efficient conversations.",
    "Provides full visibility into users' financial health through instant access in their everyday chat app.",
    "Helps users make better financial decisions through accurate spending data analysis.",
  ],
  links: {
    live: "https://ritik574-coder.github.io/Human_Behavior_Network/",
    repo: "https://github.com/Ritik574-coder/Human_Behavior_Network",
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
