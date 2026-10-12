import { useState } from 'react';
import { Gsap, GsapPresence } from '../utils/gsapAnimate';
// Note: scroll-triggered entrance animations removed from this section intentionally
import { Plus, Target, GraduationCap, Sparkles, ArrowUpRight } from 'lucide-react';

const experiences = [
  {
    role: 'Data Engineer',
    period: 'Project Work',
    context: 'Student · Project Work',
    impact: 'Primary focus, demonstrated through hands-on data pipeline and warehouse projects.',
    stack: ['SQL Server', 'T-SQL', 'Snowflake', 'Data Quality'],
    description: [
      'Built SQL Server Bronze–Silver–Gold warehouses with CSV ingestion, transformation, validation, and analytics-ready dimensional models.',
      'Implemented a Snowflake workflow to ingest nested JSON, flatten arrays, normalize relational data, and support repeatable processing.',
    ],
    primary: true,
  },
  {
    role: 'Analytics Engineer',
    period: 'Developing Focus',
    context: 'Student · Project Work',
    impact: 'Secondary development focus: shaping tested, analytics-ready retail datasets with dbt.',
    stack: ['dbt', 'Dimensional Modeling', 'Data Tests', 'Analytics Marts'],
    description: [
      'Built layered dbt models and dimensional marts for retail reporting.',
      'Added tests for uniqueness, nullability, relationships, accepted values, and business rules, with CI validation and model documentation.',
    ],
  },
  {
    role: 'AI/ML Engineering',
    period: 'Learning Direction',
    context: 'Active Learning',
    impact: 'An active learning direction alongside my data engineering project work.',
    stack: ['Learning Direction', 'AI/ML Concepts'],
    description: [
      'Currently studying AI/ML Engineering concepts; this card reflects learning, not professional experience.',
    ],
  },
];

const ExperienceItem = ({ experience, isExpanded, onToggle }) => {
  return (
    <article className="relative min-w-0">
      <div className="absolute left-[15px] top-0 h-full w-px bg-lime-400/15" />

      <div className="relative pl-8 min-w-0">
        <span className={`absolute left-[10px] top-8 h-[11px] w-[11px] rounded-full border ${isExpanded ? 'border-lime-400 bg-lime-400' : 'border-lime-400/35 bg-[#171817]'}`} />

        <button
          onClick={onToggle}
          type="button"
          className="w-full max-w-full rounded-[6px] border border-lime-400/15 bg-[#1B1E1B] text-left px-4 md:px-5 py-4 md:py-5 hover:border-lime-400/30 hover:shadow-[0_8px_24px_rgba(163,255,18,0.06)] transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/65 border border-lime-400/20 px-2.5 py-1 rounded-[2px] inline-flex items-center gap-1.5">
                  <Target className="w-3 h-3" />
                  {experience.period}
                </span>
                {experience.primary && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] bg-lime-400 text-[#171817] px-2.5 py-1 rounded-[2px]">
                    Primary Focus
                  </span>
                )}
              </div>

              <h3 className="text-[24px] md:text-[30px] lg:text-[34px] font-black uppercase tracking-[-0.02em] leading-[0.95] text-white">
                {experience.role}
              </h3>

              <p className="mt-2 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-white/55 inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {experience.context}
              </p>

              <p className="mt-5 text-sm md:text-[15px] font-light leading-relaxed text-white/70 max-w-3xl">
                {experience.impact}
              </p>
            </div>

            <Gsap.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-1 w-10 h-10 shrink-0 rounded-full border flex items-center justify-center ${isExpanded ? 'border-lime-400 bg-lime-400 text-[#171817]' : 'border-lime-400/25 text-lime-400'}`}
            >
              <Plus className="w-4.5 h-4.5" strokeWidth={1.8} />
            </Gsap.div>
          </div>
        </button>

        <GsapPresence>
          {isExpanded && (
            <Gsap.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.22, ease: 'easeOut' },
              }}
              className="overflow-hidden"
            >
              <div className="mt-2 ml-0 rounded-[6px] border border-lime-400/12 bg-[#1F201E] px-4 md:px-5 py-4 md:py-5">
                <ul className="space-y-3 max-w-3xl">
                  {experience.description.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-white/70 font-light text-sm md:text-[15px] leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-lime-400 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-4 border-t border-lime-400/10 flex flex-wrap gap-2">
                  {experience.stack.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[9.5px] md:text-[10px] uppercase tracking-[0.14em] text-lime-400 border border-lime-400/20 bg-[#171817] px-2.5 py-1 rounded-[2px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Gsap.div>
          )}
        </GsapPresence>
      </div>
    </article>
  );
};

const ProfessionalExperience = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const statCards = [
    { label: 'Career Stage', value: 'Student' },
    { label: 'Primary Focus', value: 'Data Eng.' },
    { label: 'Developing Focus', value: 'Analytics' },
    { label: 'Learning Direction', value: 'AI/ML' },
  ];

  return (
    <section id="experience-section" className="pt-20 md:pt-24 pb-24 md:pb-32 w-full relative bg-[#171817] overflow-hidden overflow-x-clip">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute right-0 top-20 w-[460px] h-[460px] bg-lime-400/6 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 relative z-10">
        <div className="flex items-center gap-3 mb-14 md:mb-16">
          <span className="w-[6px] h-[6px] rounded-full bg-lime-400 shrink-0" />
          <span className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
            03 — Experience
          </span>
          <div className="flex-1 h-px bg-lime-400/12" />
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start min-w-0">
          <aside className="lg:sticky lg:top-24 min-w-0">
            <h2 className="text-[34px] sm:text-[46px] lg:text-[56px] font-black uppercase tracking-[-0.03em] leading-[0.95] text-white">
              Professional
              <br />
              Experience
            </h2>

            <p className="mt-5 text-[14px] md:text-[15px] font-light leading-[1.8] text-white/70 max-w-[320px]">
              I am a student with no formal professional experience. My project work centers on Data Engineering; I am developing toward Analytics Engineering and actively learning AI/ML Engineering.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-2.5">
              {statCards.map((stat) => (
                <div key={stat.label} className="border border-lime-400/15 bg-[#1C1D1B] rounded-[4px] px-3.5 py-3.5">
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/55">{stat.label}</p>
                  <p className="mt-1.5 text-[22px] leading-none font-black tracking-tight text-lime-400">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <p className="font-mono text-[9px] uppercase tracking-[0.16em]">Focus areas - expand for details</p>
            </div>
          </aside>

          <div className="relative space-y-3 min-w-0 overflow-x-clip">
            {experiences.map((experience, index) => (
              <ExperienceItem
                key={experience.role}
                experience={experience}
                isExpanded={expandedIndex === index}
                onToggle={() => setExpandedIndex((current) => (current === index ? null : index))}
              />
            ))}

            <div className="pl-9 pt-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 inline-flex items-center gap-1.5">
                End of timeline
                <ArrowUpRight className="w-3 h-3 text-lime-400" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalExperience;
