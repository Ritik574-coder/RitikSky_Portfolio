import { memo, useState, lazy, Suspense } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { Trophy, ArrowUpRight, MapPin } from 'lucide-react';

const HackathonDetailModal = lazy(() => import('./HackathonDetailModal'));

/* ─────────────────────────────────────────
   Static data
   ───────────────────────────────────────── */
const achievements = [
  {
    icon: Trophy,
    rank: 'National',
    category: 'Hackathon',
    title: 'National Finalist',
    event: 'Base Indonesia Hackathon 2025',
    year: '2025',
    description: 'Competed against top engineering teams nationwide, building a decentralized solution on the Base blockchain.',
  },
];

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

/* ─────────────────────────────────────────
   Achievement Card
   ───────────────────────────────────────── */
const AchievementCard = ({ achievement, index, onClick }) => {
  const Icon = achievement.icon;
  return (
    <Gsap.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.12 + index * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative cursor-pointer rounded-[8px] overflow-hidden border border-[#A3FF12]/20 bg-[#101610] shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:border-[#A3FF12]/32 hover:shadow-[0_10px_28px_rgba(163,255,18,0.08)] transition-all duration-300"
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#A3FF12]/12 blur-3xl opacity-35 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#A3FF12]/8 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute inset-0 border border-[#A3FF12]/8 rounded-[8px] pointer-events-none" />

      <div className="relative z-10 p-6 md:p-7">
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* Category tag */}
            <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#A3FF12] border border-[#A3FF12]/20 px-2.5 py-1 rounded-[2px] bg-[#171817]/80 shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
              {achievement.category}
            </span>
            {/* Rank badge */}
            {achievement.rank && (
              <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] bg-[#A3FF12] text-[#171817] px-2.5 py-1 rounded-[2px]">
                {achievement.rank}
              </span>
            )}
          </div>
          {/* Year */}
          <span className="font-mono text-[11px] font-bold text-white/45 tabular-nums">{achievement.year}</span>
        </div>

        {/* Main content */}
        <div className="flex items-start justify-between gap-5">
          <div className="flex-1">
            {/* Index + title */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-[10px] text-[#A3FF12]/80 font-bold tabular-nums select-none border border-[#A3FF12]/15 px-1.5 py-0.5 rounded-[2px] leading-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display font-bold text-[24px] md:text-[29px] tracking-[-0.022em] text-white leading-[0.98]">
                {achievement.title}
              </h3>
            </div>

            {/* Event name */}
            <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/55 ml-8 mb-4">
              {achievement.event}
            </p>

            {/* Description */}
            {achievement.description && (
              <p className="text-[13px] text-white/70 font-light leading-[1.72] ml-8 max-w-[470px]">
                {achievement.description}
              </p>
            )}
          </div>

          {/* Icon circle */}
          <div className="shrink-0 w-11 h-11 rounded-full border border-[#A3FF12]/20 bg-[#171817] shadow-[0_2px_8px_rgba(0,0,0,0.18)] flex items-center justify-center group-hover:border-[#A3FF12]/35 transition-all duration-300">
            <Icon size={16} className="text-[#A3FF12] group-hover:text-[#D4FF7A] transition-colors duration-300" />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-5 border-t border-[#A3FF12]/10 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            Click to view details
          </span>
          <div className="flex items-center gap-1.5 text-[#A3FF12] group-hover:text-[#D4FF7A] transition-colors duration-300">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] font-bold">Open Highlight</span>
            <ArrowUpRight size={13} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Gsap.div>
  );
};

/* ─────────────────────────────────────────
   Main Component
   ───────────────────────────────────────── */
const AboutSection = memo(function AboutSection() {
  const [showHackathonDetail, setShowHackathonDetail] = useState(false);

  return (
    <section id="about-section" className="py-20 md:py-28 w-full relative bg-[#171817] overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute right-0 top-1/4 w-[520px] h-[520px] bg-[#A3FF12]/8 rounded-full blur-[110px]" />
        <div className="absolute -left-24 bottom-0 w-[380px] h-[380px] bg-[#A3FF12]/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1380px] mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Label ── */}
        <Gsap.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-16 md:mb-20"
        >
          <span className="w-[6px] h-[6px] rounded-full bg-lime-500 shrink-0" />
          <span className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
            01 — About
          </span>
          <div className="flex-1 h-px bg-[#A3FF12]/12" />
        </Gsap.div>

        <div className="grid lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr] gap-14 lg:gap-20 xl:gap-28 items-start">

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

              <div className="relative aspect-[4/5] w-full rounded-[4px] overflow-hidden border border-[#A3FF12]/15 bg-[#101610] group">
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
              <div className="bg-[#101610] border border-[#A3FF12]/15 rounded-[3px] py-3.5 px-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 mb-1.5">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#A3FF12] shrink-0" />
                  <span className="text-[13px] font-bold text-white">Available</span>
                </div>
              </div>
              <div className="bg-[#101610] border border-[#A3FF12]/15 rounded-[3px] py-3.5 px-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50 mb-1.5">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-[#A3FF12] shrink-0" />
                  <span className="text-[13px] font-bold text-white">India</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-[#101610] border border-[#A3FF12]/15 rounded-[3px] py-4 px-3 text-center">
                  <p className="font-black text-[22px] text-[#A3FF12] leading-none tabular-nums">{stat.value}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-white/50 mt-1.5 leading-tight whitespace-pre-line">{stat.label}</p>
                </div>
              ))}
            </div>
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
                <span className="block text-[44px] sm:text-[56px] lg:text-[64px] xl:text-[72px]">
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

              <span className="font-mono text-[10px] md:text-[10.5px] uppercase tracking-[0.2em] text-[#A3FF12]">
                SQL · Python · ETL Pipelines · Data Modeling
              </span>
            </Gsap.div>

            {/* Bio */}
            <Gsap.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14, duration: 0.75, ease: 'easeOut' }}
              className="space-y-4 text-[15px] md:text-[15.5px] font-light text-white/70 leading-[1.88] max-w-[580px]"
            >
              <p>
                I'm <strong className="text-[#A3FF12] font-semibold">Ritik Kumar</strong>, a Data Engineer with a strong interest in AI and Machine Learning.
              </p>
              <p>
                I enjoy working with data:building reliable pipelines, cleaning and transforming raw data, and shaping it into something structured and useful for analytics and intelligent applications. My focus areas include SQL, Python, ETL and ELT pipelines, data modeling, databases, and cloud-based data engineering.
              </p>
            </Gsap.div>

            {/* Divider */}
            <div className="mt-10 md:mt-12 mb-10 md:mb-12 h-px bg-[#A3FF12]/10 max-w-[580px]" />

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
                    className="font-mono text-[10px] md:text-[10.5px] uppercase tracking-[0.12em] font-bold text-[#A3FF12] border border-[#A3FF12]/25 bg-[#101610] px-3.5 py-[9px] rounded-[3px] hover:border-[#A3FF12] hover:text-[#171817] hover:bg-[#A3FF12] transition-all duration-200 cursor-default"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </Gsap.div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <Gsap.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22, duration: 0.75 }}
                className="mt-14 md:mt-16"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#A3FF12] shrink-0" />
                  <p className="font-mono text-[9.5px] md:text-[10px] uppercase tracking-[0.22em] text-white/55">
                    Notable Achievements
                  </p>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#A3FF12]/12 to-transparent" />
                  <span className="font-mono text-[9px] font-bold border border-[#A3FF12]/20 bg-[#101610] px-2.5 py-1 rounded-[2px] text-[#A3FF12] tabular-nums">
                    {achievements.length} Award{achievements.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {achievements.map((achievement, index) => (
                    <AchievementCard
                      key={index}
                      achievement={achievement}
                      index={index}
                      onClick={() => setShowHackathonDetail(true)}
                    />
                  ))}
                </div>
              </Gsap.div>
            )}

          </div>
        </div>
      </div>

      {/* Modal */}
      <Suspense fallback={null}>
        <HackathonDetailModal
          isOpen={showHackathonDetail}
          onClose={() => setShowHackathonDetail(false)}
        />
      </Suspense>

    </section>
  );
});

export default AboutSection;
