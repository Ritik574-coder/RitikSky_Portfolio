import React, { useState, useEffect, memo } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { Calendar, Code, ExternalLink, Users, Terminal } from 'lucide-react';

const GITHUB_USERNAME = 'Ritik574-coder';
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const HEATMAP_DAYS = 364;
const COLS = 52;
const ROWS = 7;

const INTENSITY_CLASSES = [
    'bg-[#101610]',
    'bg-[#A3FF12]/20',
    'bg-[#A3FF12]/40',
    'bg-[#A3FF12]/65',
    'bg-[#A3FF12]',
];

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function buildCalendar(data) {
    if (!data.length) return Array.from({ length: COLS }, () => Array(ROWS).fill(null));

    const byDate = new Map(data.map((day) => [day.date, day]));
    const latestDate = new Date(`${data[data.length - 1].date}T00:00:00Z`);
    latestDate.setUTCDate(latestDate.getUTCDate() + (6 - latestDate.getUTCDay()));

    return Array.from({ length: COLS }, (_, column) => (
        Array.from({ length: ROWS }, (_, row) => {
            const date = new Date(latestDate);
            date.setUTCDate(latestDate.getUTCDate() - ((COLS - 1 - column) * ROWS) - (ROWS - 1 - row));
            const dateKey = date.toISOString().slice(0, 10);
            return byDate.get(dateKey) || { date: dateKey, count: 0, level: 0 };
        })
    ));
}

function getMonthLabels(weeks) {
    return weeks.map((week, index) => {
        if (!week[0]) return '';
        const firstDate = new Date(`${week[0].date}T00:00:00Z`);
        const previousDate = index > 0 ? new Date(`${weeks[index - 1][0].date}T00:00:00Z`) : null;
        const isNewMonth = !previousDate || firstDate.getUTCMonth() !== previousDate.getUTCMonth();
        return isNewMonth ? firstDate.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) : '';
    });
}

const HeatmapCanvas = memo(function HeatmapCanvas({ data, loading }) {
    const weeks = buildCalendar(data);
    const monthLabels = getMonthLabels(weeks);

    return (
        <div className="w-full overflow-x-auto pb-1" aria-label={`GitHub contribution calendar showing ${HEATMAP_DAYS} days of activity`}>
            <div className="min-w-[620px]">
                <div className="grid grid-cols-[30px_repeat(52,minmax(0,1fr))] gap-x-1 mb-2">
                    <span />
                    {monthLabels.map((label, index) => (
                        <span key={`${label}-${index}`} className="h-4 font-mono text-[9px] text-white/40 leading-none">
                            {label}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-[30px_repeat(52,minmax(0,1fr))] gap-x-1 gap-y-1">
                    <div className="grid grid-rows-7 gap-y-1">
                        {WEEKDAY_LABELS.map((label, index) => (
                            <span key={index} className="h-3.5 font-mono text-[9px] text-white/40 leading-3.5">
                                {label}
                            </span>
                        ))}
                    </div>

                    {weeks.map((week, column) => (
                        <div key={column} className="grid grid-rows-7 gap-y-1">
                            {week.map((day, row) => (
                                <span
                                    key={day.date}
                                    title={loading ? 'Loading activity' : `${day.count} contributions on ${day.date}`}
                                    className={`block aspect-square w-full min-w-[8px] rounded-[2px] ${loading ? 'bg-[#101610]' : INTENSITY_CLASSES[Math.min(4, Math.max(0, day.level || 0))]}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/40 sm:hidden">
                    Less
                    {INTENSITY_CLASSES.map((colorClass, index) => (
                        <span key={index} className={`h-3 w-3 rounded-[2px] ${colorClass}`} />
                    ))}
                    More
                </div>
            </div>
        </div>
    );
});

const GitHubStats = memo(function GitHubStats() {
    const [userData, setUserData] = useState(null);
    const [contributionData, setContributionData] = useState([]);
    const [totalContributions, setTotalContributions] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let isCancelled = false;

        const fetchData = async () => {
            try {
                const [userRes, contribRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { signal: controller.signal }),
                    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`, { signal: controller.signal }),
                ]);

                if (isCancelled) return;

                const userJson = await userRes.json();
                if (isCancelled) return;
                setUserData(userJson);

                const contribJson = await contribRes.json();
                if (isCancelled) return;

                if (contribJson.contributions) {
                    const allDays = contribJson.contributions;
                    const total = allDays.reduce((acc, day) => acc + day.count, 0);
                    setContributionData(allDays.slice(-364));
                    setTotalContributions(total);
                }

                setLoading(false);
            } catch (error) {
                if (error?.name === 'AbortError') return;
                setLoading(false);
            }
        };

        const section = document.getElementById('github-stats-section');
        if (!section) { fetchData(); return; }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchData();
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(section);

        return () => {
            isCancelled = true;
            observer.disconnect();
            controller.abort();
        };
    }, []);

    return (
        <section id="github-stats-section" className="pt-20 md:pt-24 pb-24 md:pb-32 w-full relative bg-[#171817] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">

                {/* ── SECTION HEADER ── */}
                <Gsap.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 mb-16 md:mb-20"
                >
                    <div className="w-2 h-2 bg-[#A3FF12] rounded-full animate-pulse" />
                    <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] md:tracking-[0.26em] text-white/55">
                        05. Source_Metrics
                    </span>
                    <div className="flex-1 h-[1px] bg-[#A3FF12]/12" />
                </Gsap.div>

                {/* Big Title Area */}
                <div className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <Gsap.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.98] sm:leading-[0.9] text-white"
                    >
                        GitHub <br />
                        <span className="text-[#A3FF12]">Activity.</span>
                    </Gsap.h2>

                    <Gsap.a
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        href={GITHUB_PROFILE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 w-fit border border-[#A3FF12]/30 text-[#A3FF12] px-6 py-3 hover:bg-[#A3FF12] hover:text-[#171817] transition-all font-mono text-sm font-bold uppercase tracking-[0.14em] md:tracking-[0.2em] group"
                    >
                        <Terminal size={16} />
                        Launch_Profile
                        <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Gsap.a>
                </div>

                {/* Grid Layout Layout for Raw Data */}
                <div className="flex flex-col xl:flex-row gap-6 md:gap-8 w-full">

                    {/* Left side: Quick Numbers */}
                    <Gsap.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="xl:w-1/3 grid grid-cols-2 gap-px bg-[#A3FF12]/10 border border-[#A3FF12]/15"
                    >
                        {/* Box 1: Repositories */}
                        <div className="bg-[#101610] p-6 lg:p-8 flex flex-col justify-between aspect-square group hover:bg-[#171817] transition-colors">
                            <div className="flex items-center justify-between text-white/40 group-hover:text-[#A3FF12] transition-colors">
                                <Code size={20} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] md:tracking-[0.16em] font-bold">REPOS</span>
                            </div>
                            <div>
                                <p className="text-4xl lg:text-6xl text-white font-black tracking-tighter group-hover:text-[#A3FF12] transition-colors">
                                    {loading ? '-' : String(userData?.public_repos ?? 0).padStart(2, '0')}
                                </p>
                            </div>
                        </div>

                        {/* Box 2: Commits */}
                        <div className="bg-[#101610] p-6 lg:p-8 flex flex-col justify-between aspect-square group hover:bg-[#171817] transition-colors">
                            <div className="flex items-center justify-between text-white/40 group-hover:text-[#A3FF12] transition-colors">
                                <Terminal size={20} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] md:tracking-[0.16em] font-bold">TOTAL</span>
                            </div>
                            <div>
                                <p className="text-4xl lg:text-6xl text-white font-black tracking-tighter group-hover:text-[#A3FF12] transition-colors">
                                    {loading ? '...' : (totalContributions > 999 ? `${(totalContributions / 1000).toFixed(1)}k` : totalContributions)}
                                </p>
                            </div>
                        </div>

                        {/* Box 3: Followers */}
                        <div className="bg-[#101610] p-6 lg:p-8 flex flex-col justify-between aspect-square group hover:bg-[#171817] transition-colors">
                            <div className="flex items-center justify-between text-white/40 group-hover:text-[#A3FF12] transition-colors">
                                <Users size={20} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] md:tracking-[0.16em] font-bold">FLWRS</span>
                            </div>
                            <div>
                                <p className="text-4xl lg:text-6xl text-white font-black tracking-tighter group-hover:text-[#A3FF12] transition-colors">
                                    {loading ? '-' : String(userData?.followers ?? 0).padStart(2, '0')}
                                </p>
                            </div>
                        </div>

                        {/* Box 4: Joined */}
                        <div className="bg-[#101610] p-6 lg:p-8 flex flex-col justify-between aspect-square group hover:bg-[#171817] transition-colors">
                            <div className="flex items-center justify-between text-white/40 group-hover:text-[#A3FF12] transition-colors">
                                <Calendar size={20} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] md:tracking-[0.16em] font-bold">EST.</span>
                            </div>
                            <div>
                                <p className="text-4xl lg:text-6xl text-white font-black tracking-tighter group-hover:text-[#A3FF12] transition-colors">
                                    {loading ? '-' : (userData?.created_at ? new Date(userData.created_at).getFullYear() : '----')}
                                </p>
                            </div>
                        </div>
                    </Gsap.div>

                    {/* Right side: Matrix Output Container */}
                    <Gsap.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="xl:w-2/3 border border-[#A3FF12]/15 bg-[#232522] p-6 lg:p-10 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-8">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold uppercase text-white tracking-tight">System_Log</h3>
                                <p className="font-sans text-sm md:text-sm text-white/55 mt-2">Annual code contribution density (last 12 months)</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] md:tracking-[0.16em] text-white/40">
                                Less
                                {INTENSITY_CLASSES.map((colorClass, index) => (
                                    <span key={index} className={`w-3 h-3 rounded-[2px] ${index === 0 ? 'ml-2' : ''} ${index === INTENSITY_CLASSES.length - 1 ? 'mr-2' : ''} ${colorClass}`} />
                                ))}
                                More
                            </div>
                        </div>

                        <div className="w-full flex-1 flex flex-col justify-center">
                            <HeatmapCanvas data={contributionData} loading={loading} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center font-mono text-xs md:text-sm text-white/40">
                            <div>
                                <span className="text-lime-500 mr-2">$</span>
                                user_query --status
                            </div>
                            <div className="uppercase tracking-[0.12em] md:tracking-[0.16em] text-lime-400/80 animate-pulse">
                                ONLINE
                            </div>
                        </div>
                    </Gsap.div>

                </div>
            </div>
        </section>
    );
});

export default GitHubStats;
