import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Snowflake Semi-Structured Data Engineering",

  category: "Snowflake & Data Engineering",

  heroImg: `${import.meta.env.BASE_URL}snowflake-semi-structured-data-normalization.webp`,

  tagline:
    "A Snowflake data engineering project focused on processing nested JSON with VARIANT, extracting and flattening hierarchical structures, and transforming semi-structured data into a normalized relational data mart.",

  year: "2026",

  stack: [
    "Snowflake",
    "SQL",
    "Python",
    "Snowflake CLI",
    "VARIANT",
    "LATERAL FLATTEN",
    "JSON",
    "3NF Data Modeling",
  ],

  features: [
    "Semi-Structured JSON Processing — Stores complex and evolving JSON payloads directly in Snowflake VARIANT columns.",
    "Nested Data Exploration — Extracts customer, product, order, payment, shipping, and review attributes through Snowflake JSON path navigation.",
    "Dynamic Array Flattening — Uses LATERAL FLATTEN to convert nested JSON arrays into queryable relational rows.",
    "Multi-Level JSON Transformation — Traverses deeply nested customer, order, item, review, and comment structures across multiple hierarchy levels.",
    "Synthetic Data Generation — Generates realistic customer, product, and order payloads with nested attributes, optional fields, arrays, and missing values for engineering practice.",
    "Relational Data Normalization — Transforms deeply nested JSON into structured relational entities such as customers, orders, products, reviews, and order items.",
    "3NF Data Mart Modeling — Organizes extracted entities into related tables with primary-key and foreign-key relationships for consistent relational querying.",
    "Idempotent Data Processing — Demonstrates MERGE-based processing to update existing records and avoid duplicate results during repeated loads.",
    "Snowflake CLI Automation — Provides a repeatable command-driven workflow for database initialization, table creation, data loading, and verification.",
  ],

  impact: [
    "Designed a Snowflake staging layer that stores customer, product, and order payloads as semi-structured VARIANT data instead of forcing a rigid relational schema at ingestion.",
    "Created a deterministic Python generator that produces synthetic customer, product, and order data with realistic nested structures, optional attributes, arrays, and missing values for engineering practice.",
    "Implemented direct JSON path navigation and explicit type casting to extract scalar attributes such as customer profiles, addresses, preferences, order details, and product information from VARIANT columns.",
    "Used LATERAL FLATTEN to dynamically unnest arrays and demonstrated multi-level traversal across customers, emails, orders, items, reviews, and review comments.",
    "Built a normalization workflow that converts deeply nested JSON into related relational tables for customers, emails, orders, products, order items, reviews, and review comments.",
    "Applied relational modeling principles to reduce repeated nested information and create a structured MART layer that is easier to query with conventional SQL.",
    "Implemented an idempotent MERGE pattern for customer email processing to demonstrate how repeated processing can update existing records without creating duplicate business rows.",
    "Created a Snowflake CLI-based setup workflow that initializes the database, creates staging tables, loads generated seed data, and runs verification queries through a repeatable command sequence.",
    "Organized the project around the full semi-structured data lifecycle: synthetic generation, VARIANT ingestion, JSON exploration, array flattening, relational normalization, and incremental/idempotent processing.",
  ],

  links: {
    repo: "https://github.com/Ritik574-coder/Snowflake-Semi-Structured-Data.git",
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

export default function SnowflakeSemiStructuredDataNormalizationDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}