export const PROJECT_META = [
  {
    id: 1,
    slug: "dbt-analytics-engineering",
    title: "Retail Analytics Engineering Platform",
    displayTitle: "Retail Analytics Engineering Platform",
    category: "Analytics Engineering / Data Engineering",
    color: "bg-[#A8FF00]",
    img: `${import.meta.env.BASE_URL}retail-analytics-engineering-platform.webp`,
  },
  {
    id: 2,
    slug: "leadsup",
    title: "SkyNova — Intelligent Data Ecosystem",
    displayTitle: "SkyNova — Intelligent Data Ecosystem",
    category: "AI-Powered Lead Scoring",
    color: "bg-purple-400",
    img: `${import.meta.env.BASE_URL}skynova-intelligent-data-ecosystem.webp`,
  },
  {
    id: 3,
    slug: "polsekrembang",
    title: "Medallion Data Warehouse",
    displayTitle: "Medallion Data Warehouse",
    category: "Data Engineering & Data Warehousing",
    color: "bg-orange-400",
    img: `${import.meta.env.BASE_URL}medallion-data-warehouse.webp`,
  },
  {
    id: 4,
    slug: "floodsegmen",
    title: "Snowflake Semi-Structured Data Engineering",
    displayTitle: "Snowflake Semi-Structured Data Engineering",
    category: "Snowflake & Data Engineering",
    color: "bg-blue-400",
    img: `${import.meta.env.BASE_URL}snowflake-semi-structured-data-normalization.webp`,
  },
  {
    id: 5,
    slug: "qmeal",
    title: "SQL Server Data Warehouse",
    displayTitle: "SQL Server Data Warehouse",
    category: "Data Engineering & Data Warehousing",
    color: "bg-pink-400",
    img: `${import.meta.env.BASE_URL}sql-server-data-warehouse.webp`,
  },
  {
    id: 6,
    slug: "lostandfound",
    title: "Business Intelligence Analytics Dashboard",
    displayTitle: "Business Intelligence Analytics Dashboard",
    category: "Business Intelligence & Data Analytics",
    color: "bg-cyan-400",
    img: `${import.meta.env.BASE_URL}business-intelligence-analytics-dashboard.webp`,
  },
  {
    id: 7,
    slug: "imageclas",
    title: "Great Minds Knowledge Graph",
    displayTitle: "Great Minds Knowledge Graph",
    category: "Research Platform & Knowledge Graph",
    color: "bg-green-400",
    img: `${import.meta.env.BASE_URL}great-minds-knowledge-graph.webp`,
  },
  {
    id: 8,
    slug: "financial-assistant-bot",
    title: "Human Behavior Network",
    displayTitle: "Human Behavior Network",
    category: "Interactive Systems Visualization & AI-Assisted Product Design",
    color: "bg-amber-400",
    img: `${import.meta.env.BASE_URL}human-behavior-network.webp`,
  },
];

export const PROJECT_META_BY_SLUG = PROJECT_META.reduce((accumulator, item) => {
  accumulator[item.slug] = item;
  return accumulator;
}, {});
