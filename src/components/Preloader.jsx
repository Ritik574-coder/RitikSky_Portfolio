import { useEffect, useState, useRef } from "react";

/**
 * Preloader — ISSUE-007 fix
 *
 * Goals:
 *  - Complete in 0.8–1.2 s on a normal visit (target ~900 ms of visible time).
 *  - Skip entirely on repeat visits within the same session (sessionStorage flag).
 *  - Respect prefers-reduced-motion (instant exit).
 *  - No Math.random() inside the render loop (moved to effect).
 *  - Steady deterministic progress steps; no re-render churn from a tick timer.
 *  - Visual style preserved (terminal ASCII grid, neon-lime, scanlines).
 */

const SESSION_KEY = 'rk_preloader_seen';

// Deterministic progress steps: [target %, delay ms after previous step]
const STEPS = [
  [20,  60],
  [45,  80],
  [68, 100],
  [85,  80],
  [100, 120],
];

const WORDS = ['INITIALIZING', 'LOADING ASSETS', 'COMPILING', 'READY'];
const FILL  = ['░', '▒', '▓', '█'];

const Preloader = ({ onComplete }) => {
  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // If already seen this session, fire onComplete immediately (no render needed).
  const alreadySeen = typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem(SESSION_KEY) === '1'
    : false;

  const [progress, setProgress]   = useState(0);
  const [wordIdx,  setWordIdx]    = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [ascii, setAscii]         = useState('');
  const frameRef = useRef(0);

  /* ── Immediate exit for returning visitors / reduced motion ── */
  useEffect(() => {
    if (alreadySeen || reducedMotion) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Progress stepper ── */
  useEffect(() => {
    if (alreadySeen || reducedMotion) return;

    let stepIndex = 0;
    let elapsed   = 0;

    function scheduleNext() {
      if (stepIndex >= STEPS.length) return;
      const [target, delay] = STEPS[stepIndex++];
      elapsed += delay;
      const id = setTimeout(() => {
        setProgress(target);
        scheduleNext();
      }, elapsed);
      return id;
    }

    const firstId = scheduleNext();
    return () => clearTimeout(firstId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Word cycling (one change per ~300 ms, tied to word count) ── */
  useEffect(() => {
    if (alreadySeen || reducedMotion) return;
    if (wordIdx >= WORDS.length - 1) return;
    const id = setTimeout(() => setWordIdx(i => i + 1), 280);
    return () => clearTimeout(id);
  }, [wordIdx, alreadySeen, reducedMotion]);

  /* ── ASCII art update (runs at most once per progress change, no Math.random in render) ── */
  useEffect(() => {
    if (alreadySeen || reducedMotion) return;
    const width  = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 40;
    const filled = Math.floor((progress / 100) * width);
    let a = '';
    a += '╔' + '═'.repeat(width) + '╗\n';
    for (let r = 0; r < 5; r++) {
      let row = '║';
      for (let c = 0; c < width; c++) {
        if (c < filled) {
          row += (c === filled - 1 && progress < 100) ? FILL[(frameRef.current) % 4] : '█';
        } else {
          row += ' ';
        }
      }
      row += '║\n';
      a += row;
    }
    a += '╚' + '═'.repeat(width) + '╝\n';
    a += `\n>> SYS.MEM.${progress === 100 ? 'READY' : 'ALLOCATING'}  [${String(Math.round(progress)).padStart(3, '0')}%]`;
    if (progress === 100) {
      a += '  [OK]\n>> BOOT SEQUENCE COMPLETE.';
    } else {
      frameRef.current = (frameRef.current + 1) % 4;
      a += `  [${FILL[frameRef.current]}]\n>> PROCESSING...`;
    }
    setAscii(a);
  }, [progress, alreadySeen, reducedMotion]);

  /* ── Completion trigger ── */
  useEffect(() => {
    if (alreadySeen || reducedMotion) return;
    if (progress < 100) return;
    const id = setTimeout(() => {
      setIsExiting(true);
      sessionStorage.setItem(SESSION_KEY, '1');
      setTimeout(onComplete, 820);   // match CSS transition-duration
    }, 320);                          // brief pause to show 100 %
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  /* ── Nothing to render for returning visitors ── */
  if (alreadySeen || reducedMotion) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black text-lime-400 flex flex-col justify-between p-4 md:p-10 font-mono overflow-hidden transition-transform duration-[820ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}
      style={{ willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      aria-hidden="true"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start uppercase text-xs md:text-sm tracking-widest opacity-50">
        <span>Ritik Kumar Portfolio</span>
        <span>©2026</span>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center gap-6 w-full">
        <p className="text-xl md:text-3xl font-bold tracking-widest uppercase text-lime-400">
          &gt; {WORDS[wordIdx]}_
        </p>

        {/* ASCII progress grid */}
        <div className="text-lime-400 font-mono text-[10px] sm:text-xs md:text-sm leading-[1.1] md:leading-none whitespace-pre text-center md:text-left select-none overflow-hidden drop-shadow-[0_0_8px_rgba(163,255,18,0.5)]">
          {ascii}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end uppercase text-xs md:text-sm tracking-widest opacity-50 w-full">
        <span>System Status: {progress === 100 ? 'ONLINE' : 'BOOTING'}</span>
      </div>

      {/* Background Grid */}
      <div
        className="absolute inset-0 z-[-1] opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-[10] pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};

export default Preloader;
