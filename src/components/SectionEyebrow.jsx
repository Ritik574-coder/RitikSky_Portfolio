import { Gsap } from '../utils/gsapAnimate';

const SectionEyebrow = ({ number, label, trailing, className = '', animated = false }) => {
  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
      }
    : {};

  return (
    <Gsap.div
      {...animationProps}
      className={`flex min-w-0 items-center gap-3 ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
      <span className="shrink-0 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 sm:text-xs">
        {number} — {label}
      </span>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-lime-400/15" />
      {trailing}
    </Gsap.div>
  );
};

export default SectionEyebrow;