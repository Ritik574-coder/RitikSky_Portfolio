import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Medallion Data Warehouse",

  category: "Data Engineering & Data Warehousing",

  heroImg: `${import.meta.env.BASE_URL}medallion-data-warehouse.webp`,

  tagline:
    "A SQL Server data warehouse that transforms raw retail data into cleansed, standardized, and analytics-ready datasets through a Bronze–Silver–Gold architecture.",

  year: "2026",

  stack: [
    "Microsoft SQL Server 2022",
    "T-SQL",
    "Docker",
    "Docker Compose",
    "CSV",
    "Python",
    "Pandas",
    "Plotly",
    "SQLAlchemy",
  ],

  features: [
    "Implemented a three-layer warehouse architecture that separates raw ingestion, data cleansing, and business-ready analytical models.",
    "Built a Bronze ingestion process using SQL Server BULK INSERT, transaction control, full-refresh loading, execution logging, and error handling across eight retail datasets.",
    "Applied defensive type conversion, null handling, deduplication, text normalization, date parsing, geographic standardization, and domain-specific business rules in the Silver layer.",
    "Structured customer, employee, product, store, inventory, sales, returns, and review data to support downstream analytical workloads.",
    "Validated transaction-level financial fields and recalculated derived values when source cost, pricing, and gross-profit fields were inconsistent.",
    "Built analytical views for dimensions and facts covering customers, employees, products, stores, sales, returns, reviews, and inventory snapshots.",
    "Provided a reproducible SQL Server environment through Docker and Docker Compose with mounted source datasets and automated setup commands.",
    "Connected the Gold layer to Python through SQLAlchemy and Pandas for customer analysis and exploratory visualization.",
  ],

  impact: [
    "Established a structured retail data warehouse instead of working directly from inconsistent source files.",
    "Separated ingestion from transformation so raw source data remains available while downstream models become progressively cleaner.",
    "Improved analytical reliability by standardizing inconsistent formats and validating business fields before downstream use.",
    "Handled multiple retail business domains within a single warehouse architecture.",
    "Applied dimensional modeling concepts in the Gold layer to make the warehouse easier to consume for analytics and reporting.",
    "Created a repeatable local development environment with Docker and SQL Server rather than relying on a machine-specific database setup.",
    "Connected warehouse outputs to Python-based analysis, demonstrating an end-to-end path from ingestion to analytical consumption.",
  ],

  links: {
    repo: "https://github.com/Ritik574-coder/Medallion-Data-Warehouse",
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

export default function MedallionDataWarehouseDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}
