import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Business Intelligence Analytics Dashboard",

  category: "Business Intelligence & Data Analytics",

  heroImg: `${import.meta.env.BASE_URL}business-intelligence-analytics-dashboard.webp`,

  tagline:
    "A collection of interactive BI dashboards that transform operational, financial, workforce, sales, and market data into clear analytical insights.",

  year: "2025",

  stack: [
    "Power BI",
    "Tableau",
    "DAX",
    "Python",
    "Pandas",
    "NumPy",
    "SQL",
    "Power Query",
  ],

  features: [
    "Built interactive Power BI and Tableau dashboards with filters, drill-through views, KPI cards, charts, maps, and analytical breakdowns.",
    "Analyzed ATM transactions, revenue, operating costs, uptime, gross profit, transaction efficiency, and loss-making ATMs.",
    "Analyzed employee demographics, hiring, compensation, tenure, department distribution, performance, and workforce trends.",
    "Analyzed sales, profit, orders, customers, subcategories, year-over-year trends, and top-performing customers.",
    "Explored job volumes, salary distributions, job roles, geographic patterns, employment characteristics, and market trends.",
    "Applied structured analytical models and documented dimensions, relationships, KPIs, calculated measures, and business metrics.",
  ],

  impact: [
    "Converted raw and structured datasets into interactive analytical dashboards.",
    "Created reusable DAX measures for revenue, cost, profitability, operational efficiency, and risk analysis.",
    "Applied Python-based data preparation using Pandas and NumPy before visualization.",
    "Used Tableau calculated fields and LOD expressions for workforce and sales analysis.",
    "Designed dashboards around business questions rather than presenting raw data.",
    "Covered multiple analytical domains including banking operations, HR, sales, customer behavior, employment, and global economic data.",
  ],

  links: {
    repo: "https://github.com/Ritik574-coder/Business-Intelligence-Analytics-Dashboard",
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

export default function BusinessIntelligenceAnalyticsDashboardDetail({ onClose, mode }) {
  return (
    <ProjectCaseLayout
      project={project}
      onClose={onClose}
      closeLabel={mode === "modal" ? "Close" : "Back to Home"}
      mode={mode}
    />
  );
}
