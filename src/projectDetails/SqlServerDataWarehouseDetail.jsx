import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "SQL Server Data Warehouse",

  category: "Data Engineering & Data Warehousing",

  heroImg: `${import.meta.env.BASE_URL}sql-server-data-warehouse.webp`,

  tagline:
    "An enterprise-style SQL Server data warehouse that integrates CRM and ERP data through a Bronze–Silver–Gold architecture and delivers analytics-ready dimensional models.",

  year: "2026",

  stack: [
    "Microsoft SQL Server",
    "T-SQL",
    "Docker",
    "SQL Server Stored Procedures",
    "CSV",
    "Apache Spark",
    "PySpark",
    "Git",
  ],

  features: [
    "Integrated customer, product, sales, demographic, geographic, and product-classification data from separate CRM and ERP source systems.",
    "Built SQL Server stored procedures that perform full-load CSV ingestion into source-aligned Bronze tables using BULK INSERT, transactional control, and execution timing.",
    "Applied cleansing, standardization, normalization, validation, deduplication, derived fields, and cross-source business rules before exposing data to analytics.",
    "Conformed customer identifiers and combined CRM customer records with ERP demographic and geographic information into a unified analytical customer model.",
    "Combined CRM product information with ERP product classification data to create a richer product dimension with category, subcategory, product line, and maintenance attributes.",
    "Created Gold-layer customer and product dimensions together with a sales fact model using surrogate keys and star-schema relationships.",
    "Implemented SQL checks for duplicates, nulls, invalid dates, business-rule violations, orphan records, revenue reconciliation, dimensional integrity, and granularity.",
    "Created reporting queries for customer order volume, sales performance, monthly revenue contribution, yearly performance, quantity, pricing, and shipping-time analysis.",
    "Used PySpark in a separate analysis notebook to inspect and explore source data before warehouse processing.",
  ],

  impact: [
    "Created a structured analytical layer from multiple operational source systems rather than querying raw CRM and ERP files directly.",
    "Established clear separation between raw ingestion, transformation, and business-facing data models.",
    "Standardized inconsistent customer, product, demographic, geographic, and sales attributes across source systems.",
    "Built a reusable Gold-layer star schema designed for BI reporting, SQL analysis, and downstream analytical workloads.",
    "Added explicit data-quality validation for dimensional integrity and transactional business rules.",
    "Produced analytical SQL queries that turn the warehouse into a usable foundation for customer and sales reporting.",
  ],

  links: {
    repo: "https://github.com/Ritik574-coder/sqlserver-datawarehouse",
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

export default function SqlServerDataWarehouseDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}