import { memo, useEffect, useRef, useState } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { exponentialEaseOut } from '../utils/easing';

const DiscordIcon = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3c-.191.328-.403.775-.552 1.124a18.273 18.273 0 0 0-5.333 0C9.85 3.775 9.638 3.328 9.447 3a19.736 19.736 0 0 0-4.433 1.369C2.064 8.803 1.253 13.127 1.659 17.39a19.953 19.953 0 0 0 5.993 3.034c.486-.65.918-1.338 1.288-2.061a12.945 12.945 0 0 1-2.034-.97c.171-.126.338-.257.5-.392 3.922 1.846 8.17 1.846 12.046 0 .163.135.329.266.5.392-.652.389-1.333.715-2.034.97.37.723.802 1.411 1.288 2.061a19.919 19.919 0 0 0 5.994-3.034c.477-4.943-.815-9.228-3.883-13.021zM9.682 14.813c-1.183 0-2.157-1.085-2.157-2.419s.953-2.418 2.157-2.418c1.214 0 2.168 1.096 2.157 2.418 0 1.334-.953 2.419-2.157 2.419zm4.636 0c-1.183 0-2.157-1.085-2.157-2.419s.953-2.418 2.157-2.418c1.214 0 2.168 1.096 2.157 2.418 0 1.334-.943 2.419-2.157 2.419z" />
  </svg>
);

const BASE = import.meta.env.BASE_URL;

// One shared look for every form control, so they match the site's sharp-cornered
// #111111 cards / white-10 borders. Vertical padding scales with viewport height so the
// whole card still fits a laptop screen at 100% zoom.
const fieldClass =
  'w-full border border-white/10 bg-[#101610] px-4 py-[clamp(0.6rem,1.6svh,0.8rem)] text-sm text-white ' +
  'placeholder:text-white/35 outline-none transition-all duration-300 ' +
  'focus:border-[#A3FF12]/60 focus:shadow-[0_0_20px_rgba(163,255,18,0.12)]';

const SITEMAP = [
  { label: 'About', id: 'about-section' },
  { label: 'Projects', id: 'project-section' },
  { label: 'Experience', id: 'experience-section' },
  { label: 'Capabilities', id: 'capabilities-section' },
];

const NETWORKS = [
  { label: 'Email', href: 'mailto:ritik74820@gmail.com', icon: Mail },
  { label: 'GitHub', href: 'https://github.com/Ritik574-coder', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ritik-kumar-b81b32375/', icon: Linkedin },
];

// Shared by every network row in the right-hand column
const cardLinkClass =
  'group flex items-center justify-between border-b border-[#A3FF12]/12 py-[clamp(0.65rem,1.6svh,0.9rem)] ' +
  'transition-all duration-300 hover:border-[#A3FF12]/45';

const Footer = memo(function Footer() {
  const timeRef = useRef(null);
  const [formStatus, setFormStatus] = useState('idle');

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (window.lenisInstance && typeof window.lenisInstance.scrollTo === 'function') {
      window.lenisInstance.scrollTo(target, {
        offset: -24,
        duration: 1.5,
        easing: exponentialEaseOut
      });
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setFormStatus('sending');

    const formData = new FormData(event.currentTarget);
    formData.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '');
    formData.append('subject', 'New portfolio inquiry from Ritik Kumar');
    formData.append('from_name', 'Ritik Kumar Portfolio');
    formData.append('redirect', 'false');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setFormStatus(result.success ? 'success' : 'error');
      if (result.success) event.currentTarget.reset();
    } catch {
      setFormStatus('error');
    }
  };

  // Direct DOM update for the clock — avoids React re-render every second
  useEffect(() => {
    const updateTime = () => {
      if (!timeRef.current) return;
      const now = new Date();
      timeRef.current.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      id="contact-section"
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#171817] text-white"
    >
      {/* ── BACKDROP: cover-sized photo + palette scrims (see .scene--contact in index.css) ── */}
      <div
        className="scene scene--contact"
        aria-hidden="true"
        style={{ '--scene-photo': `url(${BASE}contect.webp)` }}
      >
        <div className="scene__photo" />
        <div className="scene__glow" />
        <div className="scene__scrim" />
      </div>

      {/* Subtle matrix grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1400px] flex-1 flex-col justify-between px-6 pb-[clamp(1rem,3svh,2rem)] pt-[clamp(5.25rem,14svh,8rem)] md:px-12">

        {/* ── SECTION HEADER ── */}
        <Gsap.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-[clamp(1.1rem,3.6svh,3rem)] flex items-center gap-4"
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#A3FF12]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 md:text-xs md:tracking-[0.26em]">
            {'// INITIALIZE_CONTACT'}
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </Gsap.div>

        {/* ── MAIN GRID ──
            <md   1 column:  intro / form / links
            md    2 columns: intro | form, then links across the full width
            lg+   3 columns: intro | form | links                                  */}
        <div className="mb-[clamp(1.5rem,5svh,4rem)] grid grid-cols-1 items-start gap-y-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.85fr)] lg:gap-x-12 xl:gap-x-16">

          {/* Left: headline + intro */}
          <div className="min-w-0">
            <h2 className="mb-[clamp(0.75rem,2.5svh,1.5rem)] break-words text-[clamp(2.75rem,13vw,3.75rem)] font-black uppercase leading-[0.9] tracking-tighter text-white sm:text-7xl md:text-6xl lg:text-[clamp(3.25rem,min(5vw,11svh),5.25rem)]">
              LET'S <br />
              <span className="inline-block pr-4 italic text-[#A3FF12]">CONNECT.</span>
            </h2>
            <p className="max-w-md font-sans text-sm leading-7 text-white/70 [text-shadow:0_1px_14px_rgb(10_10_10/0.9)] md:text-base">
              Feel free to reach out for collaborations, system architecture discussions, or just to say hello. Always open to exploring new opportunities.
            </p>
          </div>

          {/* Center: direct inquiry form */}
          <div className="min-w-0">
            <div className="w-full max-w-full border border-[#A3FF12]/18 bg-[rgba(10,15,10,0.25)] p-6 shadow-[0_0_40px_rgba(163,255,18,0.08)] backdrop-blur-md md:p-7 lg:p-[clamp(1.5rem,4svh,2.5rem)]">
              <div className="mb-[clamp(0.9rem,2.6svh,1.5rem)]">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A3FF12]">Direct inquiry</p>
                  <span className="hidden text-right font-mono text-[10px] leading-5 text-white/45 lg:block">Let's build something amazing.</span>
                </div>
                <h3 className="break-words text-2xl font-black tracking-tight md:text-3xl">Get in Touch with Ritik</h3>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-[clamp(0.7rem,1.8svh,1rem)]">
                <label className="sr-only" htmlFor="contact-name">Your Name</label>
                <input id="contact-name" name="name" required type="text" placeholder="Your Name" autoComplete="name" className={fieldClass} />
                <label className="sr-only" htmlFor="contact-email">Email Address</label>
                <input id="contact-email" name="email" required type="email" placeholder="Email Address" autoComplete="email" className={fieldClass} />
                <label className="sr-only" htmlFor="contact-phone">Phone Number</label>
                <input id="contact-phone" name="phone" required type="tel" placeholder="Phone Number" autoComplete="tel" className={fieldClass} />
                <label className="sr-only" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" required rows="3" placeholder="Message" className={`${fieldClass} h-[clamp(6rem,16svh,10rem)] resize-none`} />
                <input type="checkbox" name="botcheck" className="hidden" tabIndex="-1" autoComplete="off" />
                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="group flex w-full items-center justify-center gap-2 bg-[#A3FF12] py-[clamp(0.7rem,1.8svh,0.9rem)] font-mono text-sm font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(163,255,18,0.3)] disabled:cursor-wait disabled:opacity-60 md:tracking-[0.2em]"
                >
                  {formStatus === 'sending' ? 'Sending...' : 'Send Inquiry'}
                  <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
                {formStatus === 'success' && <p role="status" className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[#A3FF12]">Message sent successfully.</p>}
                {formStatus === 'error' && <p role="status" className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-red-300">Unable to send. Check the Web3Forms access key.</p>}
              </form>
            </div>
          </div>

          {/* Right: sitemap + networks */}
          <div className="flex min-w-0 flex-col gap-8 sm:flex-row sm:gap-x-16 md:col-span-2 lg:col-span-1 lg:flex-col lg:gap-[clamp(1.25rem,3.5svh,2rem)]">

            {/* Navigation */}
            <div className="flex flex-col gap-1.5 border border-white/10 p-4 sm:min-w-[9.5rem]">
              <span className="mb-1 border-l-2 border-white/20 pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 md:tracking-[0.24em]">Sitemap</span>
              {SITEMAP.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className="group flex items-center gap-3 py-1 text-left font-mono text-xs font-bold uppercase text-white/60 transition-colors hover:text-[#A3FF12] md:text-sm"
                >
                  <span className="h-1.5 w-1.5 bg-white/20 transition-colors group-hover:bg-[#A3FF12]" />
                  <span className="relative tracking-[0.14em] md:tracking-[0.2em]">
                    {item.label}
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#A3FF12] transition-all duration-300 group-hover:w-full" />
                  </span>
                </button>
              ))}
            </div>

            {/* Connect links */}
            <div className="flex min-w-0 flex-1 flex-col gap-2 border border-white/10 p-4 lg:flex-none">
              <span className="mb-1 border-l-2 border-[#A3FF12] pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 md:tracking-[0.24em]">Networks</span>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">
                {NETWORKS.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={cardLinkClass}>
                    <div className="flex items-center gap-3">
                      <link.icon size={16} className="text-white/40 transition-colors group-hover:text-[#A3FF12]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white/80 transition-colors group-hover:text-[#A3FF12] md:text-sm md:tracking-[0.2em]">{link.label}</span>
                    </div>
                    <ArrowUpRight size={14} className="text-white/20 transition-colors group-hover:text-[#A3FF12]" />
                  </a>
                ))}

                {/* Discord profile link */}
                <a
                  href="https://discord.com/users/1405958607429828708"
                  target="_blank"
                  rel="noreferrer"
                  className={cardLinkClass}
                  title="Open Discord profile"
                >
                  <div className="flex items-center gap-3">
                    <DiscordIcon className="text-white/40 transition-colors group-hover:text-[#A3FF12]" size={16} />
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-mono text-xs font-bold uppercase leading-none tracking-[0.14em] text-white/80 transition-colors group-hover:text-[#A3FF12] md:text-sm md:tracking-[0.2em]">
                        Discord
                      </span>
                      <span className="font-mono text-[10px] lowercase leading-none text-white/40 transition-colors group-hover:text-[#A3FF12]/70">
                        @ritik-kumar
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-white/20 transition-colors group-hover:text-[#A3FF12]" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER BOTTOM BAR ──
            md:pr-12 keeps the copyright clear of the floating chat launcher (bottom-right). */}
          <div className="mt-2 flex flex-col items-center gap-3 border-t border-white/10 pb-1 pt-6 md:flex-row md:flex-wrap md:justify-between md:gap-x-6 md:gap-y-3 md:pr-12 md:pt-6">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 md:text-xs md:tracking-[0.2em]">
            <span>SYS.STATUS:</span>
            <div className="flex min-w-16 flex-grow-0 items-center justify-center gap-2 border border-[#A3FF12]/20 bg-[#A3FF12]/10 px-2 py-0.5 text-[#A3FF12]">
              ONLINE
            </div>
          </div>

          <div ref={timeRef} className="order-first whitespace-nowrap text-center font-mono text-[10px] uppercase tabular-nums tracking-[0.18em] text-white/30 opacity-50 md:order-none md:text-xs md:tracking-[0.24em]">
            00:00:00 LOCAL
          </div>

          <div className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 md:text-right md:text-xs md:tracking-[0.2em]">
            &copy; {new Date().getFullYear()} RITIK KUMAR. ALL RIGHTS RESERVED.
          </div>
        </div>

      </div>
    </footer>
  );
});

export default Footer;