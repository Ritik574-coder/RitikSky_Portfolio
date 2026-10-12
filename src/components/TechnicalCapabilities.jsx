import { memo } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { Boxes, BrainCircuit, Cloud, Code2, Database, Network, ShieldCheck, Workflow } from 'lucide-react';

const CAPABILITIES = [
  {
    title: 'Data Pipeline Development',
    description: 'Build project pipelines with bulk CSV loading, transaction control, logging, and repeatable SQL and Snowflake CLI workflows.',
    icon: Workflow,
    status: 'Primary focus',
    primary: true,
  },
  {
    title: 'Data Warehousing & Medallion Architecture',
    description: 'Organize raw, cleansed, and business-ready datasets with Bronze–Silver–Gold layers in SQL Server and dbt.',
    icon: Database,
    status: 'Primary focus',
    primary: true,
  },
  {
    title: 'SQL & Data Transformation',
    description: 'Use T-SQL procedures, cleansing and standardization, JSON extraction, MERGE patterns, and analytical queries.',
    icon: Code2,
    status: 'Project work',
  },
  {
    title: 'Data Modeling & Analytics Engineering',
    description: 'Shape dbt staging, intermediate, and mart models; build dimensional facts and normalized relational entities.',
    icon: Boxes,
    status: 'Secondary focus',
  },
  {
    title: 'Data Quality & Validation',
    description: 'Check uniqueness, nullability, relationships, accepted values, business rules, reconciliation, and dimensional integrity.',
    icon: ShieldCheck,
    status: 'Project work',
  },
  {
    title: 'Distributed Data Processing',
    description: 'Use PySpark in a project notebook to inspect and explore source data before warehouse processing.',
    icon: Network,
    status: 'Project exploration',
  },
  {
    title: 'Cloud Data Infrastructure',
    description: 'Developing this area; current warehouse projects demonstrate reproducible local SQL Server environments with Docker and Compose, not cloud deployment.',
    icon: Cloud,
    status: 'Developing area',
  },
  {
    title: 'AI/ML Engineering Foundations',
    description: 'An additional learning direction, with project exposure to prediction-based lead scoring; no production ML claim.',
    icon: BrainCircuit,
    status: 'Learning focus',
  },
];

const TechnicalCapabilities = memo(function TechnicalCapabilities() {
  return (
    <section id="capabilities-section" className="relative w-full overflow-hidden bg-[#171817] pb-14 pt-24 sm:pb-16 md:pt-28">
      <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <span className="h-2 w-2 rounded-full bg-lime-400" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            06 — Capabilities
          </span>
          <span className="h-px flex-1 bg-lime-400/15" />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-lime-300/65 sm:block">
            Data Engineering / Analytics Engineering
          </span>
        </div>

        <div className="mb-6 grid gap-3 sm:mb-8 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-8">
          <Gsap.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-[34px] font-black uppercase leading-[0.92] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl"
          >
            Technical <span className="text-lime-400">Capabilities.</span>
          </Gsap.h2>
          <p className="max-w-xl border-l border-lime-400/25 pl-4 text-xs leading-5 text-white/65 sm:text-sm sm:leading-6 md:justify-self-end">
            Data Engineering is my primary focus, supported by hands-on analytics engineering and data platform projects. AI/ML remains an additional learning area.
          </p>
        </div>

        <Gsap.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3.5"
        >
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;

            return (
              <article
                key={cap.title}
                className={`group flex min-h-[164px] flex-col border p-4 transition-all duration-200 hover:-translate-y-0.5 sm:min-h-[174px] sm:p-5 ${cap.primary ? 'border-lime-400/35 bg-[#1D211C] hover:border-lime-400/55 hover:bg-[#20251E]' : 'border-white/[0.09] bg-[#1B1E1B] hover:border-lime-400/25 hover:bg-[#1E221E]'}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center border transition-colors ${cap.primary ? 'border-lime-400/30 bg-lime-400/10 text-lime-300 group-hover:border-lime-400/50' : 'border-white/10 bg-black/10 text-white/65 group-hover:border-lime-400/25 group-hover:text-lime-300'}`}>
                    <Icon aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.8} />
                  </span>
                  <span className={`font-mono text-[8px] font-bold uppercase tracking-[0.12em] sm:text-[9px] ${cap.primary ? 'text-lime-300/75' : 'text-white/40'}`}>
                    {cap.status}
                  </span>
                </div>
                <h3 className={`max-w-[28ch] text-[15px] font-bold uppercase leading-[1.15] tracking-[-0.01em] transition-colors sm:text-base ${cap.primary ? 'text-white group-hover:text-lime-200' : 'text-white/90 group-hover:text-white'}`}>
                  {cap.title}
                </h3>
                <p className="mt-2 text-[11px] leading-[1.55] text-white/55 sm:text-xs sm:leading-[1.6]">
                  {cap.description}
                </p>
              </article>
            );
          })}
        </Gsap.div>
      </div>
    </section>
  );
});

export default TechnicalCapabilities;
