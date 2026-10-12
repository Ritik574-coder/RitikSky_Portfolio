import { useState } from "react";
import { Gsap } from "../utils/gsapAnimate";

import {
    SiPython,
    SiTensorflow,
    SiPytorch,
    SiKeras,
    SiScikitlearn,
    SiOpencv,
    SiStreamlit,
    SiGooglegemini,
    SiNumpy,
    SiPandas,
    SiApachespark,
    SiSnowflake,
    SiDbt,
    SiJinja,
    SiSqlalchemy,
    SiPlotly,
    SiTableau,
    SiGithubactions,
    SiDocker,
    SiGit,
} from "react-icons/si";

import {
    BarChart3,
    Boxes,
    ChevronDown,
    Cloud,
    Code2,
    Database,
    FileJson2,
    FileSpreadsheet,
    GitBranch,
    History,
    Layers,
    ShieldCheck,
    TerminalSquare,
    Workflow,
} from "lucide-react";

const stackCategories = [
    {
        title: "Data Engineering & Pipelines",
        description: "Ingestion, transformation, and pipeline building",
        icon: Workflow,
        primary: true,
        skills: [
            { name: "Python", icon: SiPython, detail: "Data generation and warehouse workflows", status: "Project work" },
            { name: "SQL / T-SQL", icon: Database, detail: "Ingestion, transformation, and validation", status: "Project work" },
            { name: "Apache Spark / PySpark", icon: SiApachespark, detail: "Source exploration and distributed processing", status: "Project work" },
            { name: "ETL / ELT", icon: Workflow, detail: "Layered ingestion and transformation patterns", status: "Project work" },
            { name: "CSV Ingestion", icon: FileSpreadsheet, detail: "Bulk loads into Bronze warehouse layers", status: "Project work" },
            { name: "JSON Processing", icon: FileJson2, detail: "Nested payloads and semi-structured data", status: "Project work" },
            { name: "Stored Procedures & BULK INSERT", icon: TerminalSquare, detail: "SQL Server loading and repeatable runs", status: "Project work" },
        ]
    },
    {
        title: "Data Warehousing & Databases",
        description: "Relational platforms, warehouse layers, and data access",
        icon: Database,
        skills: [
            { name: "Microsoft SQL Server", icon: Database, detail: "Bronze–Silver–Gold warehouse projects", status: "Project work" },
            { name: "Snowflake", icon: SiSnowflake, detail: "Semi-structured data and relational marts", status: "Project work" },
            { name: "Snowflake CLI", icon: SiSnowflake, detail: "Repeatable setup, loading, and verification", status: "Project work" },
            { name: "SQLAlchemy", icon: SiSqlalchemy, detail: "Python access to warehouse data", status: "Project work" },
            { name: "VARIANT & LATERAL FLATTEN", icon: SiSnowflake, detail: "Nested JSON transformation in Snowflake", status: "Project work" },
            { name: "3NF Data Modeling", icon: Layers, detail: "Normalized relational data marts", status: "Project work" },
        ]
    },
    {
        title: "Analytics Engineering",
        description: "Tested dbt models, marts, and data quality",
        icon: Boxes,
        skills: [
            { name: "dbt Core", icon: SiDbt, detail: "Staging, intermediate, and mart models", status: "Project work" },
            { name: "dbt-sqlserver", icon: SiDbt, detail: "SQL Server adapter for dbt", status: "Project work" },
            { name: "dbt-utils", icon: SiDbt, detail: "Reusable macros and model helpers", status: "Project work" },
            { name: "Jinja & Macros", icon: SiJinja, detail: "Reusable SQL transformation logic", status: "Project work" },
            { name: "Data Quality Tests", icon: ShieldCheck, detail: "Uniqueness, nulls, relationships, and rules", status: "Project work" },
            { name: "Dimensional Modeling", icon: Layers, detail: "Kimball-style dimensions and facts", status: "Project work" },
            { name: "Snapshots & SCD Type 2", icon: History, detail: "Historical changes in analytical models", status: "Project work" },
            { name: "Incremental Models", icon: Workflow, detail: "Targeted processing for transactional data", status: "Project work" },
            { name: "dbt Docs & Lineage", icon: GitBranch, detail: "Model dependencies and documentation", status: "Project work" },
        ]
    },
    {
        title: "Data Processing & Analytics",
        description: "Python data preparation, analysis, and BI",
        icon: BarChart3,
        skills: [
            { name: "Pandas", icon: SiPandas, detail: "Preparation and analysis of warehouse data", status: "Project work" },
            { name: "NumPy", icon: SiNumpy, detail: "Data preparation for analytical dashboards", status: "Project work" },
            { name: "Plotly", icon: SiPlotly, detail: "Exploratory data visualization", status: "Project work" },
            { name: "Power BI", icon: BarChart3, detail: "Interactive business intelligence dashboards", status: "Project work" },
            { name: "Tableau", icon: SiTableau, detail: "Calculated fields and LOD analysis", status: "Project work" },
            { name: "DAX", icon: Code2, detail: "Reusable analytical measures", status: "Project work" },
            { name: "Power Query", icon: Workflow, detail: "Dashboard data preparation", status: "Project work" },
            { name: "Matplotlib", icon: BarChart3, detail: "Listed in the existing skills inventory", status: "Portfolio listed" },
            { name: "Seaborn", icon: BarChart3, detail: "Listed in the existing skills inventory", status: "Portfolio listed" },
        ]
    },
    {
        title: "Cloud & Infrastructure",
        description: "Containerized development and cloud learning",
        icon: Cloud,
        skills: [
            { name: "Docker", icon: SiDocker, detail: "Reproducible SQL Server environments", status: "Project work" },
            { name: "Docker Compose", icon: Boxes, detail: "Local multi-service project setup", status: "Project work" },
            { name: "Microsoft Azure", icon: Cloud, detail: "Listed in the existing skills inventory", status: "Portfolio listed" },
        ]
    },
    {
        title: "AI / ML Engineering",
        description: "An additional learning direction, not a production claim",
        icon: Workflow,
        learning: true,
        skills: [
            { name: "PyTorch", icon: SiPytorch, detail: "Deep learning study", status: "Learning" },
            { name: "TensorFlow", icon: SiTensorflow, detail: "Deep learning study", status: "Learning" },
            { name: "Keras", icon: SiKeras, detail: "Neural-network API study", status: "Learning" },
            { name: "Scikit-learn", icon: SiScikitlearn, detail: "Machine-learning workflow study", status: "Learning" },
            { name: "OpenCV", icon: SiOpencv, detail: "Computer-vision study", status: "Learning" },
            { name: "Streamlit", icon: SiStreamlit, detail: "Model interface and demo tooling", status: "Learning" },
            { name: "Google Gemini", icon: SiGooglegemini, detail: "Generative AI learning", status: "Learning" },
            { name: "RAG Patterns", icon: Database, detail: "Retrieval-augmented generation concepts", status: "Learning" },
            { name: "MLOps", icon: Workflow, detail: "Machine-learning operations concepts", status: "Learning" },
        ]
    },
    {
        title: "Development & Engineering Tools",
        description: "Version control, CI/CD, and verification workflows",
        icon: GitBranch,
        skills: [
            { name: "Git", icon: SiGit, detail: "Version control across data projects", status: "Project work" },
            { name: "GitHub Actions", icon: SiGithubactions, detail: "dbt validation and deployment workflows", status: "Project work" },
        ]
    }
];

const TechStack = () => {
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const activeCategory = stackCategories[activeCategoryIndex];
    const ActiveCategoryIcon = activeCategory.icon;

    return (
        <section id="tech-stack-section" className="relative w-full overflow-hidden bg-[#171817] py-8 sm:py-10 lg:min-h-screen lg:py-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-6 md:px-12">
                <Gsap.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-4 md:mb-6"
                >
                    <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
                        <span className="h-2 w-2 rounded-full bg-lime-400" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 md:text-xs">04 — Technology Stack</span>
                        <span className="h-px flex-1 bg-lime-400/15" />
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-lime-400/70 sm:block">Project work + learning</span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-[1.05fr_0.95fr] md:items-end md:gap-6">
                        <div>
                            <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-lime-400 sm:text-[10px]">Primary focus / Data Engineering</p>
                            <h2 className="max-w-3xl text-[32px] font-black uppercase leading-[0.92] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                                Data Engineering <span className="text-lime-400">Stack.</span>
                            </h2>
                        </div>
                        <div className="max-w-2xl border-l border-lime-400/25 pl-3 sm:pl-5 md:pl-7">
                            <p className="text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">
                                Project-backed data engineering, with Analytics Engineering developing and AI/ML as an active learning area.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 sm:mt-3 sm:gap-2">
                                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-lime-300/75 sm:border sm:border-lime-400/25 sm:bg-lime-400/10 sm:px-2 sm:py-1 sm:text-[9px]">Hands-on project work</span>
                                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/50 sm:border sm:border-white/10 sm:bg-white/[0.03] sm:px-2 sm:py-1 sm:text-[9px]">Currently learning</span>
                                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/40 sm:border sm:border-white/10 sm:bg-white/[0.03] sm:px-2 sm:py-1 sm:text-[9px]">Existing inventory</span>
                            </div>
                        </div>
                    </div>
                </Gsap.div>

                <div className="grid min-w-0 gap-2 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-4">
                    <label className="relative block lg:hidden">
                        <span className="sr-only">Technology category</span>
                        <select
                            value={activeCategoryIndex}
                            onChange={(event) => setActiveCategoryIndex(Number(event.target.value))}
                            className="h-11 w-full appearance-none border border-lime-400/30 bg-[#1B1E1B] pl-3 pr-10 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white focus:border-lime-400 focus:outline-none"
                        >
                            {stackCategories.map((category, index) => (
                                <option key={category.title} value={index}>
                                    {String(index + 1).padStart(2, "0")} / {category.title} · {category.skills.length}
                                </option>
                            ))}
                        </select>
                        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-300" />
                    </label>

                    <nav aria-label="Technology categories" className="hidden gap-1.5 lg:grid lg:grid-cols-1 lg:content-start">
                        {stackCategories.map((category, index) => {
                            const CategoryIcon = category.icon;
                            const isActive = activeCategoryIndex === index;

                            return (
                                <button
                                    key={category.title}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => setActiveCategoryIndex(index)}
                                    className={`group flex min-h-[54px] min-w-0 items-center gap-2.5 border px-3 py-2 text-left transition-all duration-200 ${isActive ? "border-lime-400/55 bg-[#20251D] shadow-[inset_3px_0_0_#a3e635,0_12px_28px_rgba(0,0,0,0.16)]" : "border-white/[0.08] bg-[#1B1E1B]/70 hover:border-lime-400/25 hover:bg-[#1E211E]"}`}
                                >
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center border ${isActive ? "border-lime-400/35 bg-lime-400/10 text-lime-300" : "border-white/10 bg-black/10 text-white/55 group-hover:text-lime-300"}`}>
                                        <CategoryIcon aria-hidden="true" className="h-[17px] w-[17px]" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className={`block break-words text-[10px] font-bold uppercase leading-[1.3] tracking-[0.07em] sm:text-[11px] ${isActive ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                                            {category.title}
                                        </span>
                                        <span className={`mt-1 block font-mono text-[9px] ${isActive ? "text-lime-300/80" : "text-white/35"}`}>
                                            {String(category.skills.length).padStart(2, "0")} technologies
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <div aria-live="polite" className="relative min-w-0 overflow-hidden border border-lime-400/20 bg-[#111411]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-lime-400/[0.055] to-transparent" />
                        <div className="relative border-b border-white/[0.08] px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
                            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-lime-400/30 bg-lime-400/10 text-lime-300 sm:h-9 sm:w-9">
                                        <ActiveCategoryIcon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-lime-400/70 sm:text-[9px]">
                                            {String(activeCategoryIndex + 1).padStart(2, "0")} / {String(stackCategories.length).padStart(2, "0")} · {activeCategory.primary ? "Primary domain" : activeCategory.learning ? "Learning direction" : "Supporting domain"}
                                        </p>
                                        <h3 className="break-words text-[14px] font-black uppercase leading-tight tracking-tight text-white sm:text-lg md:text-xl">
                                            {activeCategory.title}
                                        </h3>
                                    </div>
                                </div>
                                <span className={`shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] sm:px-2.5 sm:text-[9px] ${activeCategory.learning ? "border-white/15 bg-white/[0.04] text-white/60" : "border-lime-400/20 bg-lime-400/[0.07] text-lime-300"}`}>
                                    {activeCategory.learning ? "Currently learning" : "Project-backed"}
                                </span>
                            </div>
                            <p className="ml-[44px] mt-1.5 max-w-2xl text-[10px] leading-4 text-white/55 sm:ml-[48px] sm:text-xs sm:leading-5">
                                {activeCategory.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 p-1.5 sm:gap-2 sm:p-3 lg:grid-cols-3 lg:gap-2.5 lg:p-4">
                            {activeCategory.skills.map((skill) => {
                                const SkillIcon = skill.icon;

                                return (
                                    <article
                                        key={skill.name}
                                        className="group flex min-h-[72px] min-w-0 flex-col border border-white/[0.08] bg-[#191C19] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-400/30 hover:bg-[#1D211D] sm:min-h-[84px] sm:p-2.5 lg:min-h-[100px] lg:p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/[0.09] bg-[#111411] text-white/85 transition-colors group-hover:border-lime-400/25 group-hover:text-lime-300 sm:h-8 sm:w-8">
                                                <SkillIcon aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                                            </span>
                                            <span className={`max-w-[78px] text-right font-mono text-[7px] uppercase leading-[1.25] tracking-[0.04em] sm:max-w-[88px] sm:text-[8px] ${skill.status === "Project work" ? "text-lime-300/65" : "text-white/45"}`}>
                                                {skill.status}
                                            </span>
                                        </div>
                                        <h4 className="mt-2 break-words text-[10px] font-bold leading-[1.3] text-white sm:mt-2.5 sm:text-[12px]">
                                            {skill.name}
                                        </h4>
                                        <p className="mt-1.5 hidden break-words text-[10px] leading-[1.4] text-white/45 lg:block">
                                            {skill.detail}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechStack;
