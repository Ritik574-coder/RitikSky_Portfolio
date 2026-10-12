import React, { useState, useEffect, memo } from 'react';
import { Gsap } from '../utils/gsapAnimate';
import { Activity, CalendarDays, CircleAlert, Code2, ExternalLink, RefreshCw, Users } from 'lucide-react';

const GITHUB_USERNAME = 'Ritik574-coder';
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const HEATMAP_DAYS = 364;
const COLS = 52;
const ROWS = 7;

const INTENSITY_CLASSES = [
    'bg-[#303630]',
    'bg-lime-400/30',
    'bg-lime-400/50',
    'bg-lime-400/75',
    'bg-lime-400',
];

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function buildCalendar(data) {
    const byDate = new Map(data.map((day) => [day.date, day]));
    const latestDate = data.length
        ? new Date(`${data[data.length - 1].date}T00:00:00Z`)
        : new Date();
    if (!data.length) latestDate.setUTCHours(0, 0, 0, 0);
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

const HeatmapCanvas = memo(function HeatmapCanvas({ data, loading, error, onRetry }) {
    if (error) {
        return (
            <div className="flex min-h-[170px] flex-col items-center justify-center gap-3 text-center" role="status">
                <CircleAlert className="h-5 w-5 text-white/45" aria-hidden="true" />
                <p className="text-sm text-white/65">Contribution activity is unavailable right now.</p>
                <button type="button" onClick={onRetry} className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400">
                    Retry data request
                </button>
            </div>
        );
    }

    if (!loading && !data.length) {
        return (
            <div className="flex min-h-[170px] items-center justify-center text-center" role="status">
                <p className="max-w-sm text-sm leading-6 text-white/55">No contribution dates were returned for this period.</p>
            </div>
        );
    }

    const weeks = buildCalendar(data);
    const monthLabels = getMonthLabels(weeks);
    const gridColumns = 'grid-cols-[28px_repeat(52,minmax(0,1fr))]';

    return (
        <div className="w-full overflow-x-auto pb-2" aria-label={`GitHub contribution calendar showing ${HEATMAP_DAYS} days of activity`}>
            <div className="min-w-[660px]">
                <div className={`mb-2 grid ${gridColumns} gap-x-[3px]`}>
                    <span />
                    {monthLabels.map((label, index) => (
                        <span key={`${label}-${index}`} className="h-4 font-mono text-[9px] font-medium leading-none text-white/65">
                            {label}
                        </span>
                    ))}
                </div>

                <div className={`grid ${gridColumns} gap-x-[3px] gap-y-[3px]`} role="img" aria-label="Daily contributions over the last 12 months; hover a day for its date and count.">
                    <div className="grid grid-rows-7 gap-y-[3px]">
                        {WEEKDAY_LABELS.map((label, index) => (
                            <span key={index} className="h-[10px] font-mono text-[9px] leading-[10px] text-white/55">
                                {label}
                            </span>
                        ))}
                    </div>

                    {weeks.map((week, column) => (
                        <div key={column} className="grid grid-rows-7 gap-y-[3px]">
                            {week.map((day, row) => (
                                <span
                                    key={`${day.date}-${row}`}
                                    title={loading ? 'Loading contribution data' : `${day.count} contributions on ${day.date}`}
                                    className={`block aspect-square w-full rounded-[2px] ring-1 ring-inset ring-white/[0.04] transition-colors ${loading ? 'animate-pulse bg-white/[0.06]' : INTENSITY_CLASSES[Math.min(4, Math.max(0, day.level || 0))]}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/55" aria-label="Contribution intensity legend">
                    <span className="mr-1">Less</span>
                    {INTENSITY_CLASSES.map((colorClass, index) => (
                        <span key={index} className={`h-3 w-3 rounded-[2px] ring-1 ring-inset ring-white/10 ${colorClass}`} />
                    ))}
                    <span className="ml-1">More</span>
                </div>
                <p className="mt-2 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-white/35 sm:hidden">Swipe to explore all 52 weeks</p>
            </div>
        </div>
    );
});

const formatMetric = (value, status) => {
    if (status === 'loading') return '…';
    if (status !== 'ready' || value === null || value === undefined || value === '') return 'Unavailable';
    return typeof value === 'number' ? value.toLocaleString('en-US') : value;
};

const MetricCard = memo(function MetricCard({ icon: Icon, label, value, status, note }) {
    const displayValue = formatMetric(value, status);
    const unavailable = displayValue === 'Unavailable';

    return (
        <article className="group flex min-h-[118px] flex-col justify-between border border-white/[0.08] bg-[#111411] p-4 transition-colors duration-200 hover:border-lime-400/25 hover:bg-[#191D19] sm:min-h-[126px]">
            <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/55 sm:text-[10px]">{label}</span>
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-lime-300/75 transition-colors group-hover:text-lime-300" />
            </div>
            <div className="mt-4 min-w-0">
                <p className={`break-words font-display font-bold leading-none tracking-tight transition-colors group-hover:text-lime-300 ${unavailable ? 'text-[13px] text-white/55' : 'text-2xl text-white sm:text-3xl'}`}>
                    {displayValue}
                </p>
                <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">{note}</p>
            </div>
        </article>
    );
});

const GitHubStats = memo(function GitHubStats() {
    const [userData, setUserData] = useState(null);
    const [contributionData, setContributionData] = useState([]);
    const [totalContributions, setTotalContributions] = useState(null);
    const [userStatus, setUserStatus] = useState('loading');
    const [contributionStatus, setContributionStatus] = useState('loading');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let isCancelled = false;
        let hasStarted = false;
        let observer = null;

        const requestJson = async (url) => {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`GitHub request failed (${response.status})`);
            return response.json();
        };

        const fetchData = async () => {
            if (hasStarted) return;
            hasStarted = true;
            setUserStatus('loading');
            setContributionStatus('loading');

            const results = await Promise.allSettled([
                requestJson(`https://api.github.com/users/${GITHUB_USERNAME}`),
                requestJson(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`),
            ]);

            if (isCancelled) return;

            const [userResult, contributionResult] = results;
            if (
                userResult.status === 'fulfilled' &&
                Number.isFinite(userResult.value?.public_repos) &&
                Number.isFinite(userResult.value?.followers)
            ) {
                setUserData(userResult.value);
                setUserStatus('ready');
            } else {
                setUserData(null);
                setUserStatus('error');
            }

            const days = contributionResult.status === 'fulfilled'
                ? contributionResult.value?.contributions
                : null;
            const validDays = Array.isArray(days) && days.every((day) => (
                typeof day.date === 'string' && Number.isFinite(day.count)
            ));

            if (validDays) {
                setContributionData(days.slice(-HEATMAP_DAYS));
                setTotalContributions(days.reduce((total, day) => total + day.count, 0));
                setContributionStatus('ready');
            } else {
                setContributionData([]);
                setTotalContributions(null);
                setContributionStatus('error');
            }
        };

        const section = document.getElementById('github-stats-section');
        if (!section || !('IntersectionObserver' in window)) {
            fetchData();
        } else {
            observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    fetchData();
                    observer?.disconnect();
                }
            }, { rootMargin: '160px' });
            observer.observe(section);
        }

        return () => {
            isCancelled = true;
            observer?.disconnect();
            controller.abort();
        };
    }, [retryCount]);

    const isLoading = userStatus === 'loading' || contributionStatus === 'loading';
    const hasError = userStatus === 'error' || contributionStatus === 'error';
    const profileYear = userData?.created_at ? String(new Date(userData.created_at).getFullYear()) : null;
    const retry = () => setRetryCount((count) => count + 1);
    const profileStatus = userStatus === 'error' ? 'error' : userStatus;
    const contributionValueStatus = contributionStatus === 'error' ? 'error' : contributionStatus;

    const metrics = [
        { label: 'Public repositories', icon: Code2, value: userData?.public_repos, status: profileStatus, note: 'Public profile' },
        { label: 'Contributions', icon: Activity, value: totalContributions, status: contributionValueStatus, note: 'Last 12 months' },
        { label: 'Followers', icon: Users, value: userData?.followers, status: profileStatus, note: 'Current profile' },
        { label: 'Member since', icon: CalendarDays, value: profileYear, status: profileStatus, note: 'GitHub account' },
    ];

    const statusLabel = isLoading ? 'Fetching live data' : hasError ? 'Some data unavailable' : 'Live data';

    return (
        <section id="github-stats-section" className="relative w-full overflow-hidden bg-[#171817] pt-20 pb-6 md:pt-24 md:pb-10">
            <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-lime-400" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 sm:text-xs">05 — GitHub Activity</span>
                    <span className="h-px flex-1 bg-lime-400/15" />
                    <span className={`inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] sm:text-[9px] ${hasError ? 'text-white/45' : 'text-lime-300/70'}`} role="status" aria-live="polite">
                        <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'animate-pulse bg-white/45' : hasError ? 'bg-white/35' : 'bg-lime-400'}`} />
                        {statusLabel}
                    </span>
                </div>

                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-7">
                    <Gsap.h2
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[34px] font-black uppercase leading-[0.92] tracking-[-0.035em] text-white sm:text-5xl"
                    >
                        GitHub <span className="text-lime-400">Activity.</span>
                    </Gsap.h2>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={retry}
                            disabled={isLoading}
                            aria-label="Refresh GitHub statistics"
                            title="Refresh live data"
                            className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/65 transition-colors hover:border-lime-400/35 hover:text-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400 disabled:cursor-wait disabled:opacity-40"
                        >
                            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <a
                            href={GITHUB_PROFILE_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 border border-lime-400/35 px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-lime-300 transition-colors hover:bg-lime-400 hover:text-[#171817] focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400 sm:px-4 sm:text-[11px]"
                        >
                            View GitHub profile
                            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </header>

                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(290px,0.82fr)_minmax(0,1.65fr)] lg:gap-5">
                    <Gsap.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45 }}
                        className="grid grid-cols-2 gap-2.5 sm:gap-3"
                    >
                        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
                        {userStatus === 'error' && (
                            <p className="col-span-2 px-1 text-[11px] leading-5 text-white/50" role="status">
                                Profile statistics could not be loaded. Those values are unavailable, not zero.
                            </p>
                        )}
                    </Gsap.div>

                    <Gsap.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="min-w-0 border border-lime-400/15 bg-[#202320] p-4 sm:p-5"
                    >
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
                            <div>
                                <h3 className="text-base font-bold uppercase tracking-tight text-white sm:text-lg">Contribution activity</h3>
                                <p className="mt-1 text-xs text-white/50">Daily contributions · last 12 months</p>
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">52 weeks</span>
                        </div>

                        <HeatmapCanvas
                            data={contributionData}
                            loading={contributionStatus === 'loading'}
                            error={contributionStatus === 'error'}
                            onRetry={retry}
                        />

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3 font-mono text-[8px] uppercase tracking-[0.1em] text-white/40 sm:text-[9px]">
                            <span>Source · GitHub contribution API</span>
                            <span className="shrink-0">{contributionStatus === 'ready' ? 'Updated live' : contributionStatus === 'loading' ? 'Loading' : 'Unavailable'}</span>
                        </div>
                    </Gsap.div>
                </div>
            </div>
        </section>
    );
});
export default GitHubStats;
