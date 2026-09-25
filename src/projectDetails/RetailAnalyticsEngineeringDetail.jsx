import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Retail Analytics Engineering Platform",
  category: "Analytics Engineering / Data Engineering",
  heroImg: `${import.meta.env.BASE_URL}dbt-analytics-engineering-overview.webp`,
  tagline:
    "An end-to-end retail analytics engineering platform built with dbt and Microsoft SQL Server, transforming raw operational data through Staging, Intermediate, and Marts layers into analytics-ready dimensional models.",
  year: "2026",
  stack: [
    "dbt Core 1.11.11",
    "dbt-sqlserver 1.10.0",
    "SQL Server 2022",
    "Python 3.11+",
    "SQL / T-SQL",
    "Docker",
    "GitHub Actions",
    "dbt-utils",
    "Jinja / Macros",
  ],
  features: [
    "Bronze -> Silver -> Gold architecture using dbt staging, intermediate, and marts layers.",
    "Retail modeling across customers, transactions, products, employees, stores, inventory, returns, and reviews.",
    "Kimball-style dimensional modeling with reusable dim_* and fct_* analytical models.",
    "Reusable SQL/Jinja macros for date standardization, phone normalization, and string cleanup.",
    "Automated data-quality checks covering uniqueness, nullability, relationships, accepted values, and business rules.",
    "Incremental processing patterns for transactional workloads to avoid unnecessary full rebuilds.",
    "Historical-data workflows with dbt snapshots and SCD Type 2 concepts.",
    "GitHub Actions CI/CD for parsing, validation, dbt execution, testing, deployment, and documentation.",
    "Dockerized SQL Server environment for reproducible local development.",
    "dbt Docs and lineage DAGs for model dependencies, metadata, and maintainability.",
  ],
  impact: [
    "Transforms raw retail data into structured, analytics-ready datasets for reporting and BI workflows.",
    "Applies production-oriented analytics engineering practices across modeling, testing, documentation, Git, and CI/CD.",
    "Provides a modular foundation that can scale across multiple retail business domains.",
    "Demonstrates practical use of dbt, dimensional modeling, data quality governance, macros, snapshots, and incremental transformations.",
  ],
  links: {
    live: "https://github.com/Ritik574-coder/dbt-analytics-engineering",
    repo: "https://github.com/Ritik574-coder/dbt-analytics-engineering",
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

export default function RetailAnalyticsEngineeringDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}