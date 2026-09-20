import { memo, useRef, useState, useEffect } from 'react';
import { Gsap, useGsapReducedMotion, useGsapScroll, useGsapTransform } from '../utils/gsapAnimate';
import { Terminal, Code2, Database, Cpu, Download, ArrowUpRight } from 'lucide-react';

// Shared Intl formatter — created once, reused on every tick
const jakartaFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

// === LOCATION & TIME BADGE ===
// Uses direct DOM update via ref to avoid React re-renders every second
const LocationTimeBadge = () => {
  const timeRef = useRef(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const update = () => {
      if (timeRef.current) timeRef.current.textContent = formatter.format(new Date());
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs uppercase tracking-[0.15em] text-white/55">
      <span className="font-bold text-white/75">Based in India</span>
      <span className="w-px h-3 bg-white/20" />
      <span className="tabular-nums"><span className="hidden sm:inline text-white/35">LOCAL: </span><span ref={timeRef} className="font-bold text-white/70" /></span>
    </div>
  );
};

const OrbitingDecoration = ({ icon: Icon, className }) => (
  <div className={\`absolute hidden sm:flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full border border-lime-400/15 bg-black/35 backdrop-blur-md shadow-[0_10px_30px_rgba(163,230,53,0.08)] \${className}\`}>
    <Icon size={18} className="text-white/65" />
  </div>
);

const HeroSection = memo(function HeroSection({ isRevealed = true }) {
  const containerRef = useRef(null);
  const reduceMotion = useGsapReducedMotion();
  const [enableParallax, setEnableParallax] = useState(false);

  const { scrollYProgress } = useGsapScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useGsapTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useGsapTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    if (typeof window === 'undefined' || reduceMotion) {
      setEnableParallax(false);
      return;
    }

    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const update = () => setEnableParallax(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [reduceMotion]);

  return (
    <header
      ref={containerRef}
      id="hero-section"
      className="min-h-[100svh] w-full relative overflow-hidden bg-[#071008] text-white flex flex-col items-center justify-center pt-20 pb-12"
    >
      <Gsap.div
        style={enableParallax ? { y: bgY } : undefined}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img
          src="/hero-ritik-horse.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[64%_center] opacity-[0.96]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,10,6,0.96)_0%,rgba(4,10,6,0.84)_38%,rgba(4,10,6,0.30)_62%,rgba(4,10,6,0.10)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(126,173,55,0.16),transparent_42%),linear-gradient(to_bottom,rgba(0,0,0,0.18),rgba(0,0,0,0.46))]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_24%,rgba(0,0,0,0.40)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#071008] to-transparent" />
      </Gsap.div>

      <Gsap.div
        style={enableParallax ? { y: contentY } : undefined}
        className="relative z-10 w-full max-w-[1380px] px-6 md:px-10 lg:px-16 flex items-center min-h-[calc(100svh-100px)]"
      >
        <div className="w-full max-w-[700px] text-left">
          <Gsap.div
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5"
          >
            <LocationTimeBadge />
          </Gsap.div>

          <div className="relative">
            <OrbitingDecoration icon={Code2} className="left-[-10px] top-4 -translate-x-full" />
            <OrbitingDecoration icon={Database} className="right-0 top-8 translate-x-[110%]" />
            <OrbitingDecoration icon={Terminal} className="left-6 bottom-2 -translate-x-full translate-y-full" />

            <Gsap.h1
              initial={false}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(4.5rem,11vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.055em] text-white"
            >
              RITIK
            </Gsap.h1>

            <Gsap.h1
              initial={false}
              animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(4.5rem,11vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.055em] mt-2 text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.90)]"
            >
              KUMAR
            </Gsap.h1>
          </div>

          <Gsap.div
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ delay: 0.26, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7"
          >
            <h2 className="text-[clamp(1.35rem,3.6vw,2.2rem)] font-bold tracking-tight text-white/88 flex flex-wrap gap-x-2 gap-y-1 items-center">
              Engineering <span className="bg-lime-400 text-black px-2.5 py-1 rounded-sm">Intelligence</span> Through Data<span className="text-lime-400">.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-base md:text-lg leading-7 text-white/62">
              Data Engineer focused on reliable pipelines, analytics systems, data modeling and AI-ready infrastructure.
            </p>
          </Gsap.div>

          <Gsap.div
            initial={false}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.36, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 mt-7"
          >
            <button
              onClick={() => document.getElementById('project-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 bg-lime-400 text-black px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.10em] hover:bg-lime-300 transition-colors"
            >
              View Projects <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <a
              href="/cv.pdf"
              download
              className="group inline-flex items-center gap-2 border border-white/35 bg-white/5 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.10em] text-white hover:bg-white hover:text-black transition-colors"
            >
              Download CV <Download size={16} />
            </a>
          </Gsap.div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 border-t border-white/12 pt-6 max-w-2xl">
            {[
              ["8+", "PROJECTS"],
              ["5+", "DOMAINS"],
              ["10+", "TOOLS"],
              ["01", "FOCUS"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-black text-lime-400 tracking-tight">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/42 font-mono">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            <span className="w-8 h-px bg-lime-400" />
            <span>Turning data into meaningful systems</span>
          </div>
        </div>
      </Gsap.div>
    </header>
  );
});

export default HeroSection;
