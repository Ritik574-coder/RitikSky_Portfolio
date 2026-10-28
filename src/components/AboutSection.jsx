import { memo } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { MapPin } from 'lucide-react';
import SectionEyebrow from './SectionEyebrow';
import { AboutContentCards, AboutContentProvider } from './AboutContentHub';

/* ─────────────────────────────────────────
   Static data
   ───────────────────────────────────────── */
const STATS = [
  { value: 'BUILD', label: 'Hands-on\nApproach' },
  { value: 'DATA+AI', label: 'Engineering\nStack' },
  { value: 'OPEN', label: 'To\nCollab' },
];

const CAPABILITIES = [
  'DATA ENGINEERING',
  'DATA MODELING',
  'DATA WAREHOUSING',
  'ETL / ELT',
];

import VoiceIntroCard from './VoiceIntroCard';

/* ─────────────────────────────────────────
   Main Component
   ───────────────────────────────────────── */
const AboutSection = memo(function AboutSection() {
  return (
    <section id="about-section" className="py-20 md:py-28 w-full relative bg-[#171817] overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute right-0 top-1/4 w-[520px] h-[520px] bg-lime-400/8 rounded-full blur-[110px]" />
        <div className="absolute -left-24 bottom-0 w-[380px] h-[380px] bg-lime-400/4 rounded-full blur-[100px]" />
      </div>

      <AboutContentProvider>
      <div className="max-w-[1380px] mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Label ── */}
        <SectionEyebrow number="01" label="About" animated className="mb-16 md:mb-20" />

        <div className="grid md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-8 lg:gap-12 xl:gap-16 items-start">

          {/* ══════════════════════════════
              LEFT COLUMN — Image & Meta
              ══════════════════════════════ */}
          <Gsap.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            {/* Profile image with decorative offset border */}
            <div className="relative">
              <div className="absolute -top-2.5 -left-2.5 w-full h-full border border-lime-400/25 rounded-[4px] pointer-events-none" />

              <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] rounded-[4px] overflow-hidden border border-lime-400/15 bg-[#101610] group">
                <picture>
                  <source srcSet={`${import.meta.env.BASE_URL}ritik_portfolio.webp`} type="image/webp" />
                  <img
                    src={`${import.meta.env.BASE_URL}ritik_portfolio.webp`}
                    alt="Ritik Kumar"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                  />
                </picture>

                {/* Name plate at bottom */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pt-10 pb-4 bg-gradient-to-t from-black/65 via-black/30 to-transparent z-20">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/50 mb-0.5">Name</p>
                  <p className="text-white font-bold text-[15px] tracking-wide leading-snug">Ritik Kumar</p>
                </div>

                {/* Corner brackets */}
                <span className="absolute top-3.5 left-3.5 w-5 h-px bg-white/65 z-20" />
                <span className="absolute top-3.5 left-3.5 w-px h-5 bg-white/65 z-20" />
                <span className="absolute bottom-3.5 right-3.5 w-5 h-px bg-white/65 z-20" />
                <span className="absolute bottom-3.5 right-3.5 w-px h-5 bg-white/65 z-20" />
              </div>
            </div>

            {/* Status + Location */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="bg-[#101610] border border-lime-400/15 rounded-[3px] py-3.5 px-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 mb-1.5">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-lime-400 shrink-0" />
                  <span className="text-[13px] font-bold text-white">Available</span>
                </div>
              </div>
              <div className="bg-[#101610] border border-lime-400/15 rounded-[3px] py-3.5 px-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 mb-1.5">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-lime-400 shrink-0" />
                  <span className="text-[13px] font-bold text-white">India</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-[#101610] border border-lime-400/15 rounded-[3px] py-4 px-3 text-center">
                  <p className="font-black text-[22px] md:text-base lg:text-[22px] text-lime-400 leading-none tabular-nums">{stat.value}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/50 mt-1.5 leading-tight whitespace-pre-line">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Voice Introduction */}
            <VoiceIntroCard />
          </Gsap.div>

          {/* ══════════════════════════════
              RIGHT COLUMN — Content
              ══════════════════════════════ */}
          <div className="flex flex-col">

            {/* Headline */}
            <Gsap.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 md:mb-10"
            >
              {/* Eyebrow */}
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/55 mb-5">
                Based in India — Open to Work
              </p>

              {/* Main title */}
              <h2 className="font-display font-bold tracking-[-0.025em] leading-[1.08] text-white">
                <span className="block text-[44px] sm:text-[56px] md:text-[44px] lg:text-[64px] xl:text-[72px]">
                  Data Engineer
                </span>

                <span className="block text-[22px] sm:text-[26px] lg:text-[30px] xl:text-[34px] font-medium tracking-[-0.01em] text-white/70 mt-2">
                  Scalable Data Pipeline Engineering
                </span>
              </h2>
            </Gsap.div>

            {/* Role subtitle */}
            <Gsap.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.65 }}
              className="flex items-center gap-3 mb-8 md:mb-9"
            >

              <span className="font-mono text-[10px] md:text-[10.5px] uppercase tracking-[0.2em] text-lime-400">
                SQL · Python · ETL Pipelines · Data Modeling
              </span>
            </Gsap.div>

            {/* Bio */}
            <Gsap.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14, duration: 0.75, ease: 'easeOut' }}
              className="space-y-4 text-[15px] md:text-[15.5px] font-light text-white/70 leading-[1.88] max-w-2xl"
            >
              <p>
                I'm <strong className="text-lime-400 font-semibold">Ritik Kumar</strong>, a Data Engineer focused on data engineering and analytics engineering, with AI and Machine Learning as additional skills.
              </p>
              <p>
                I enjoy working with data: building reliable pipelines, cleaning and transforming raw data, and shaping it into something structured and useful for analytics and intelligent applications. My focus areas include SQL, Python, ETL and ELT pipelines, data modeling, databases, and cloud-based data engineering.
              </p>
            </Gsap.div>

            {/* Divider */}
            <div className="mt-8 md:mt-10 mb-8 md:mt-10 h-px bg-lime-400/10 max-w-2xl" />

            {/* Core Capabilities */}
            <Gsap.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18, duration: 0.75 }}
            >
              <p className="font-mono text-[9.5px] md:text-[10px] uppercase tracking-[0.22em] text-white/55 mb-4">
                Core Focus & Supporting Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {CAPABILITIES.map((cap, i) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] md:text-[10.5px] uppercase tracking-[0.12em] font-bold text-lime-400 border border-lime-400/25 bg-[#101610] px-3.5 py-[9px] rounded-[3px] hover:border-lime-400 hover:text-[#171817] hover:bg-lime-400 transition-all duration-200 cursor-default"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </Gsap.div>

            {/* Collections: 4 compact cards in 2x2 grid */}
            <Gsap.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22, duration: 0.75 }}
              className="mt-8 md:mt-10 max-w-2xl"
            >
              <AboutContentCards />
            </Gsap.div>

          </div>
        </div>
      </div>
      </AboutContentProvider>

    </section>
  );
});

export default AboutSection;
