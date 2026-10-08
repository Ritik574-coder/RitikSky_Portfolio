// ─── Portfolio Data (single source of truth for site content) ────
//
// This is the LIVE data the site renders and the AI assistant reads. It is
// imported by `src/services/aiContext.js` and `src/components/ChatWidget.jsx`.
//
// CUSTOMIZING: edit the values below with your own details. For a clean,
// fully-commented starter template (with guidance on every field), see
// `src/data/examplePortfolioData.js`. See also `docs/customization.md`.
//
// FIELDS TO EDIT:
//   profile.name / role / bio / location / email / socials  → your identity
//   experience[]   → your work / organization / education history
//   techStack[]    → your skills, grouped by `category`
//   projects[]     → short project summaries (keep `slug` in sync with
//                    projectMeta.js + projectDetailsData.js)
//   achievements[] → awards / hackathons (optional)
//   capabilities[] → high-level specializations
export const PORTFOLIO_DATA = {
    profile: {
        name: "Ritik Kumar",
        role: "Data Engineer",
        bio: "Hi, I'm Ritik — a Data Engineer focused on data engineering and analytics engineering, with AI and Machine Learning as additional skills. I enjoy building reliable pipelines, cleaning and transforming raw data, and shaping it into something structured and useful for analytics and intelligent applications. My focus areas include SQL, Python, ETL and ELT pipelines, data modeling, databases, and cloud-based data engineering.",
        location: "India",
        email: "ritik74820@gmail.com",
        socials: {
            github: "https://github.com/Ritik574-coder",
            linkedin: "https://www.linkedin.com/in/ritik-kumar-b81b32375/"
        }
    },
    experience: [
        {
            title: "Google Developer Student Club - Universitas Dian Nuswantoro",
            period: "Nov 2023 - Nov 2025",
            description: [
                "Actively participating in developer community events, workshops, and collaborative study sessions.",
                "Contributed to 5+ community discussions across 4 projects, sharing insights on development and analytics."
            ]
        },
        {
            title: "Data Analyst - Blockvizo",
            period: "Jun 2024 - Jul 2025",
            description: [
                "Processed 50,000+ game hash history records, examining item drop patterns and building probability-based prediction models that improved forecasting accuracy by 35%.",
                "Delivered actionable insights through data visualization dashboards, supporting strategic decisions for decentralized projects and reducing analysis time by 40%.",
                "Specializing in predictive airdrop and winning probability analysis by examining large-scale on-chain data from 10+ Web3 ecosystems"
            ]
        },
        {
            title: "Lab Assistant - Programming Lab, Universitas Dian Nuswantoro",
            period: "Aug 2025 - Present",
            description: [
                "Assisted in over 3 academic lab sessions per week for programming and software development courses.",
                "Mentored around 110 junior students by guiding them through practical exercises and foundational programming concepts."
            ]
        },
        {
            title: "Machine Learning Cohort - ASAH (led by Dicoding x Accenture)",
            period: "Aug 2025 - Jan 2026",
            description: [
                "Served as Project Manager, leading a cross-functional team of 5 machine learning engineers and React developers to build solutions addressing real-world business problems.",
                "Managing the development of a banking sales prediction portal that improves sales efficiency by prioritizing high-probability leads and reducing time wasted on low-potential prospects.",
                "Coordinated project timelines, technical discussions, and workflow execution across departments, improving team time efficiency by 70% and ensuring on-time delivery."
            ]
        },
        {
            title: "AI Engineer Cohort - PIJAK (led by Dicoding x IBM)",
            period: "Jan 2026 - Present",
            description: [
                "Selected as one of the top talents for an intensive AI Engineering bootcamp focusing on Generative AI, Deep Learning, and Ethics.",
                "Developing advanced AI solutions using Python, applying industry-standard practices from IBM SkillsBuild curriculum.",
                "Collaborating on a capstone project to solve real-world challenges through innovative Artificial Intelligence implementation."
            ]
        }
    ],
    techStack: [
        { name: "Python", category: "Language" },
        { name: "TensorFlow", category: "Deep Learning" },
        { name: "PyTorch", category: "Deep Learning" },
        { name: "React", category: "Frontend" },
        { name: "Next.js", category: "Frontend" },
        { name: "Tailwind CSS", category: "Frontend" },
        { name: "PostgreSQL", category: "Database" },
        { name: "Supabase", category: "Backend" },
        { name: "Docker", category: "DevOps" },
        { name: "MLOps", category: "Machine Learning Operations" },
        { name: "Scikit-Learn", category: "Machine Learning" },
        { name: "OpenCV", category: "Computer Vision" },
        { name: "FastAPI", category: "Backend" },
        { name: "Streamlit", category: "ML Deployment" },
        { name: "Pandas", category: "Data Analysis" },
        { name: "Matplotlib", category: "Visualization" },
        { name: "Seaborn", category: "Visualization" },
        { name: "Keras", category: "Deep Learning" },
        { name: "Numpy", category: "Data Science" },
        { name: "Google Gemini", category: "LLM / GenAI" },
        { name: "RAG", category: "AI Architecture" },
        { name: "ExpressJS", category: "Backend" },
        { name: "Microsoft Azure", category: "Cloud" }
    ],
    projects: [
        {
            slug: "dbt-analytics-engineering",
            title: "Retail Analytics Engineering Platform",
            category: "Analytics Engineering / Data Engineering",
            description: "An end-to-end retail analytics engineering platform built with dbt and Microsoft SQL Server, transforming raw operational data through Staging, Intermediate, and Marts layers into analytics-ready dimensional models."
        },
        {
            slug: "leadsup",
            title: "SkyNova — Intelligent Data Ecosystem",
            category: "AI-Powered Lead Scoring",
            description: "An AI-powered sales portal that prioritizes the most promising prospects for term deposit subscriptions - helping sales teams focus on high-value leads and boost follow-up efficiency."
        },
        {
            slug: "polsekrembang",
            title: "Medallion Data Warehouse",
            category: "Data Engineering & Data Warehousing",
            description: "A SQL Server data warehouse that transforms raw retail data into cleansed, standardized, and analytics-ready datasets through a Bronze–Silver–Gold architecture."
        },
        {
            slug: "floodsegmen",
            title: "Snowflake Semi-Structured Data Engineering",
            category: "Snowflake & Data Engineering",
            description: "A Snowflake data engineering project focused on processing nested JSON with VARIANT, extracting and flattening hierarchical structures, and transforming semi-structured data into a normalized relational data mart."
        },
        {
            slug: "qmeal",
            title: "SQL Server Data Warehouse",
            category: "Data Engineering & Data Warehousing",
            description: "An enterprise-style SQL Server data warehouse that integrates CRM and ERP data through a Bronze–Silver–Gold architecture and delivers analytics-ready dimensional models."
        },
        {
            slug: "lostandfound",
            title: "Business Intelligence Analytics Dashboard",
            category: "Business Intelligence & Data Analytics",
            description: "A collection of interactive BI dashboards that transform operational, financial, workforce, sales, and market data into clear analytical insights."
        },
        {
            slug: "imageclas",
            title: "Great Minds Knowledge Graph",
            category: "Research Platform & Knowledge Graph",
            description: "An evidence-aware research platform for studying how exceptional people think, decide, fail, adapt, and build through structured knowledge and connected evidence."
        },
        {
            slug: "financial-assistant-bot",
            title: "Human Behavior Network",
            category: "Interactive Systems Visualization & AI-Assisted Product Design",
            description: "An interactive systems-visualization platform that maps relationships among money, data, incentives, and power to explore how complex forces shape human behavior."
        }
    ],
    achievements: [
        {
            title: "National Finalist - Base Indonesia Hackathon 2025",
            project: "Base Realms",
            description: "Built an onchain 16-bit RPG battle game on Base chain with QRIS payment integration, ERC-721/ERC-1155 NFTs, and seasonal reward pools. Onboards non-crypto users through familiar payment methods.",
            team: "Terra Bit (Ritik Kumar & Gagah Athallah Fatha)",
            track: "Base Track",
            techStack: ["Solidity", "Next.js", "TypeScript", "JavaScript", "CSS"],
            links: {
                devfolio: "https://devfolio.co/projects/base-realms-b63a",
                github: "https://github.com/Ritik574-coder/Base-Realms",
                live: "https://baserealms.app/"
            }
        }
    ],
    capabilities: [
        "Machine Learning",
        "Deep Learning",
        "Computer Vision",
        "Natural Language Processing (NLP)",
        "Machine Learning Operations (MLOps)",
        "Data Analysis",
        "Web Development"
    ]
};
