'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ThreatDemo from '@/components/ThreatDemo';

/* ── tiny inline components ─────────────────────────────────────────── */

function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── animated stat counter ───────────────────────────────────────────── */
function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1400;
        const steps = 40;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          setCount(Math.round((end * step) / steps));
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black gradient-blue tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

/* ── animated terminal demo ──────────────────────────────────────────── */
const DEMO_LINES = [
  { ms: 0,    text: 'npm install express-router-util mongose reactt',  type: 'cmd' },
  { ms: 500,  text: '',                                                  type: 'blank' },
  { ms: 600,  text: '[AegisNode] Evaluating 3 packages...',             type: 'info' },
  { ms: 1100, text: '  ✗ express-router-util  →  HALLUCINATED',        type: 'err' },
  { ms: 1500, text: '  ✗ mongose              →  TYPOSQUAT of mongoose',type: 'err' },
  { ms: 1900, text: '  ✗ reactt               →  TYPOSQUAT of react',  type: 'err' },
  { ms: 2300, text: '',                                                  type: 'blank' },
  { ms: 2400, text: "[AEGISNODE SECURITY OVERRIDE]: Installation blocked.",      type: 'override' },
  { ms: 2500, text: "Package 'express-router-util' flagged as HALLUCINATED.",    type: 'override' },
  { ms: 2600, text: "Package 'mongose' flagged as TYPOSQUAT. Do not install.",   type: 'override' },
  { ms: 2700, text: "Package 'reactt' flagged as TYPOSQUAT. Do not install.",    type: 'override' },
  { ms: 3100, text: '',                                                  type: 'blank' },
  { ms: 3200, text: 'npm install express mongoose react',               type: 'cmd2' },
  { ms: 3700, text: '[AegisNode] Evaluating 3 packages...',             type: 'info' },
  { ms: 4100, text: '  ✓ express    →  safe',                          type: 'ok' },
  { ms: 4400, text: '  ✓ mongoose   →  safe',                          type: 'ok' },
  { ms: 4700, text: '  ✓ react      →  safe',                          type: 'ok' },
  { ms: 5000, text: '',                                                  type: 'blank' },
  { ms: 5100, text: '[AegisNode] All 3 verified. Proceeding...',        type: 'success' },
  { ms: 5200, text: 'added 247 packages in 3.1s',                      type: 'npm' },
];

const LINE_STYLE: Record<string, string> = {
  cmd:      'text-white',
  cmd2:     'text-white',
  blank:    'text-transparent select-none',
  info:     'text-sky-400',
  err:      'text-red-400',
  override: 'text-red-300 font-medium',
  ok:       'text-emerald-400',
  success:  'text-emerald-300',
  npm:      'text-gray-500',
};

function HeroTerminal() {
  const [shown, setShown] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const timers = DEMO_LINES.map((l, i) =>
      setTimeout(() => setShown(i + 1), l.ms)
    );
    const restart = setTimeout(() => setShown(0), DEMO_LINES[DEMO_LINES.length-1].ms + 3500);
    return () => [...timers, restart].forEach(clearTimeout);
  }, [shown === 0 ? 0 : undefined]);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10"
      style={{ boxShadow: '0 0 0 1px rgba(59,130,246,0.1), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.06)' }}
    >
      {/* title bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="flex-1 text-center text-xs text-gray-600 font-mono">
          Windows PowerShell — AegisNode Protected
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-500 font-mono font-medium">ACTIVE</span>
        </div>
      </div>

      {/* body */}
      <div
        className="terminal bg-[#080d1a] p-5 text-[13px] leading-6 min-h-[340px]"
        role="log"
        aria-label="Live AegisNode terminal demo"
        aria-live="polite"
      >
        <p className="text-gray-700 text-xs mb-4 font-mono">Windows PowerShell 7.4.0 — AegisNode v1.0.0</p>

        {DEMO_LINES.slice(0, shown).map((line, i) => (
          <div key={i} className={`font-mono ${LINE_STYLE[line.type]}`}>
            {line.type === 'cmd' || line.type === 'cmd2' ? (
              <>
                <span className="text-blue-400">PS</span>
                <span className="text-gray-600"> ~/project</span>
                <span className="text-gray-500"> ❯ </span>
                {line.text}
              </>
            ) : (
              line.text || '\u00A0'
            )}
          </div>
        ))}

        {/* blinking cursor */}
        {shown > 0 && (
          <span
            className="inline-block w-2 h-[14px] bg-blue-400 translate-y-[2px] ml-0.5"
            style={{ opacity: cursor ? 1 : 0, transition: 'opacity 0.05s' }}
          />
        )}
      </div>
    </div>
  );
}

/* ── threat type card ────────────────────────────────────────────────── */
function ThreatTypeCard({
  icon, label, color, example, description,
}: {
  icon: string; label: string; color: string; example: string; description: string;
}) {
  const colorMap: Record<string, string> = {
    red:    'from-red-950/60 border-red-800/30 text-red-400',
    orange: 'from-orange-950/60 border-orange-800/30 text-orange-400',
    yellow: 'from-yellow-950/60 border-yellow-800/30 text-yellow-400',
  };
  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-b ${colorMap[color]} hover:scale-[1.02] transition-transform duration-200`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-sm font-bold mb-1 font-mono uppercase tracking-wider" style={{ color: 'inherit' }}>{label}</div>
      <code className="text-xs text-gray-500 font-mono block mb-3 bg-black/20 px-2 py-1 rounded">{example}</code>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── flow step ───────────────────────────────────────────────────────── */
function FlowStep({
  num, title, sub, icon, isLast = false,
}: {
  num: string; title: string; sub: string; icon: string; isLast?: boolean;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-blue-950/50 border border-blue-700/30 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 font-bold font-mono text-sm">{num}</span>
        </div>
        {!isLast && <div className="w-px h-full bg-gradient-to-b from-blue-700/30 to-transparent mt-2 min-h-[32px]" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}

/* ── install step ────────────────────────────────────────────────────── */
function InstallStep({ n, cmd, label, note }: { n: number; cmd: string; label: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.05]">
        <div className="step-circle">{n}</div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {note && <span className="ml-auto text-xs text-gray-600 italic">{note}</span>}
        <button
          onClick={copy}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <><CheckIcon /><span className="text-emerald-400">Copied!</span></>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </button>
      </div>
      <pre className="terminal px-4 py-3 text-sm text-emerald-300 overflow-x-auto bg-black/30">
        <code>{cmd}</code>
      </pre>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen bg-[#050810] overflow-x-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% -15%, rgba(59,130,246,0.10) 0%, transparent 70%)',
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)',
      }} />

      <NavBar />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative pt-36 pb-20 px-6 text-center"
        style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}
      >
        {/* top badge */}
        <div className="animate-fade-up inline-flex items-center gap-2.5 glass-blue px-4 py-2 rounded-full text-sm text-blue-400 font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
          Open-source · Windows-native · npm Security Middleware
        </div>

        {/* headline */}
        <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-black tracking-tighter leading-none mb-6">
          <span className="gradient-text">AegisNode</span>
        </h1>

        <p className="animate-fade-up delay-200 text-xl sm:text-2xl font-semibold text-white mb-4 max-w-3xl mx-auto leading-snug">
          Your AI coding agent just tried to install a package that&nbsp;
          <span className="gradient-red">doesn&apos;t exist.</span>
        </p>

        <p className="animate-fade-up delay-300 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AegisNode intercepts every <code className="text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded text-sm">npm install</code> before
          it runs — blocking hallucinated package names, typosquatting attacks, and known malware.
          Zero friction for legitimate packages.
        </p>

        <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="#install" id="cta-install" className="btn-primary text-base">
            Install in 60 seconds <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#demo" id="cta-demo" className="btn-secondary text-base">
            Try live scanner
          </Link>
          <a
            href="https://github.com/your-username/aegisnode"
            id="cta-github"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>

        {/* terminal */}
        <div className="animate-fade-up delay-500 max-w-3xl mx-auto">
          <HeroTerminal />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE PROBLEM
          ═══════════════════════════════════════════════════════════════ */}
      <section id="problem" className="section-divider relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge-warn inline-flex mb-4">⚠ The Problem</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
              AI agents install packages blindly
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tools like GitHub Copilot, Cursor, Claude, and Devin generate and run
              <code className="text-blue-400 mx-1 bg-blue-950/40 px-1 rounded">npm install</code>
              commands without verifying the package exists or is safe. This causes three types of attacks:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <ThreatTypeCard
              icon="👻"
              label="Hallucinated"
              color="red"
              example="npm install express-router-util"
              description="AI models invent package names that sound plausible but don't exist on npm. Attackers register these names with malicious payloads waiting to be installed."
            />
            <ThreatTypeCard
              icon="🎭"
              label="Typosquat"
              color="orange"
              example="npm install mongose  # mongoose"
              description="One-character typos in popular package names lead to malicious clones. The package installs fine but runs a backdoor, cryptominer, or credential stealer."
            />
            <ThreatTypeCard
              icon="⛓️"
              label="Supply Chain"
              color="yellow"
              example="npm install event-stream@3.3.6"
              description="Real packages that were compromised after becoming popular. AegisNode maintains a curated blocklist of confirmed supply-chain attack packages."
            />
          </div>

          {/* real attack examples */}
          <div className="mt-10 glass rounded-2xl p-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-mono mb-4">Real-world examples blocked by AegisNode</p>
            <div className="grid sm:grid-cols-2 gap-3 terminal text-sm">
              {[
                ['crossenv',        'Typosquat of cross-env — steals env vars',       'TYPOSQUAT'],
                ['event-stream',    'Compromised — cryptominer in dependency',          'MALICIOUS'],
                ['ua-parser-js',    'Hijacked — cryptominer + credential stealer',     'MALICIOUS'],
                ['mongose',         'Typosquat of mongoose — data exfiltration',       'TYPOSQUAT'],
                ['nodemailer-js',   'Fake nodemailer — harvests SMTP credentials',     'MALICIOUS'],
                ['axois',           'Typosquat of axios — posts your data externally', 'TYPOSQUAT'],
              ].map(([pkg, reason, type]) => (
                <div key={pkg} className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div>
                    <code className="text-red-400">{pkg}</code>
                    <p className="text-xs text-gray-600 mt-0.5">{reason}</p>
                  </div>
                  <span className="badge-blocked flex-shrink-0">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-divider border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="badge-info inline-flex mb-4">⚙ How It Works</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">
              Three layers. Zero friction.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every <code className="text-blue-400 mx-1 bg-blue-950/40 px-1 rounded">npm install</code> runs through
              a three-layer evaluation pipeline. Safe packages proceed instantly.
              Blocked packages never touch your disk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* flow diagram */}
            <div className="glass rounded-2xl p-6">
              <FlowStep
                num="01" icon="💻"
                title="Shell Intercept"
                sub="aegisnode init injects a function into your PowerShell $PROFILE. Every npm install is silently routed to aegisnode-proxy — you never notice the difference for safe packages."
              />
              <FlowStep
                num="02" icon="📦"
                title="Package Name Extraction"
                sub="The proxy parses the full npm command, extracting package names while ignoring flags (--save-dev, -D, -g etc). Scoped packages and version specifiers handled correctly."
              />
              <FlowStep
                num="03" icon="🗄️"
                title="Local Cache Check"
                sub="First checks %LOCALAPPDATA%\AegisNode\cache.json — a local copy of the GitHub blocklist refreshed every 24 hours. Zero network latency, works offline."
              />
              <FlowStep
                num="04" icon="🔬"
                title="Heuristic API Analysis"
                sub="Unknown packages are sent to the /api/verify Netlify edge function which checks: registry existence, publish age, download counts, and Levenshtein distance."
              />
              <FlowStep
                num="05" icon="✅"
                title="Safe → Real npm Spawns"
                sub="Verified packages are passed to the real npm-cli.js via absolute path — preventing infinite loops. Full stdout/stderr streaming so AI agents see normal output."
                isLast
              />
            </div>

            {/* layer cards */}
            <div className="space-y-4">
              {[
                {
                  layer: 'Layer 1',
                  name: 'Local Blocklist Cache',
                  latency: '< 1ms',
                  color: 'blue',
                  desc: 'Downloads a curated blocklist from GitHub Raw once every 24 hours and stores it locally. Catches all known malicious packages with zero network round-trip.',
                  checks: ['crossenv', 'event-stream', 'ua-parser-js', 'nodemailer-js', '+ 16 more'],
                },
                {
                  layer: 'Layer 2',
                  name: 'npm Registry Check',
                  latency: '~200ms',
                  color: 'purple',
                  desc: 'Queries registry.npmjs.org for the package. If it returns 404, the package is flagged as HALLUCINATED — it simply doesn\'t exist.',
                  checks: ['404 → HALLUCINATED', 'Published < 48h + downloads < 100 → SUSPICIOUS'],
                },
                {
                  layer: 'Layer 3',
                  name: 'Levenshtein Typosquat',
                  latency: '~5ms',
                  color: 'cyan',
                  desc: 'Computes edit distance against the top 1,000 npm packages. A distance of 1-2 characters from a popular package is a strong typosquat signal.',
                  checks: ['reactt → react (dist 1)', 'expres → express (dist 1)', 'mongose → mongoose (dist 1)'],
                },
              ].map((item) => {
                const colorStyles: Record<string, string> = {
                  blue:   'border-blue-700/30 bg-blue-950/20',
                  purple: 'border-purple-700/30 bg-purple-950/20',
                  cyan:   'border-cyan-700/30 bg-cyan-950/20',
                };
                const badgeStyles: Record<string, string> = {
                  blue:   'bg-blue-950/60 text-blue-400 border-blue-800/50',
                  purple: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
                  cyan:   'bg-cyan-950/60 text-cyan-400 border-cyan-800/50',
                };
                return (
                  <div key={item.layer} className={`rounded-xl border p-5 ${colorStyles[item.color]}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyles[item.color]}`}>
                        {item.layer}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">{item.latency}</span>
                    </div>
                    <h3 className="font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">{item.desc}</p>
                    <div className="space-y-1">
                      {item.checks.map((c) => (
                        <div key={c} className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                          <span className="text-red-500">✗</span> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          <StatCounter end={20}  suffix="+"  label="Known threats blocked" />
          <StatCounter end={1}   suffix="ms" label="Avg local cache check" />
          <StatCounter end={24}  suffix="h"  label="Blocklist cache TTL" />
          <StatCounter end={1000} suffix="+" label="Packages in typosquat DB" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE DEMO
          ═══════════════════════════════════════════════════════════════ */}
      <section id="demo" className="section-divider border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="badge-info inline-flex mb-4">🔍 Live Scanner</div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              Check any package right now
            </h2>
            <p className="text-gray-400">
              The scanner hits the real npm registry and our heuristic engine — the same logic the CLI uses.
            </p>
          </div>
          <ThreatDemo />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LLM OUTPUT FORMAT
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section-divider border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="badge-warn inline-flex mb-4">🤖 Built for AI Agents</div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              AI agents understand and stop retrying
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              When a package is blocked, AegisNode writes a specifically-formatted message to <code className="text-blue-400">stderr</code> designed
              for LLM parsers — not just humans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-3 font-medium">❌ What the AI agent tried:</p>
              <div className="terminal glass rounded-xl p-4 text-sm">
                <p className="text-gray-500">PS C:\project&gt;</p>
                <p className="text-white mt-1">npm install express-router-util mongose</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3 font-medium">🛡️ What AegisNode outputs to stderr:</p>
              <div className="terminal glass-red rounded-xl p-4 text-sm">
                <p className="text-red-300 leading-relaxed">
                  [AEGISNODE SECURITY OVERRIDE]: Installation blocked. Package &apos;express-router-util&apos; flagged as HALLUCINATED. Do not attempt to install this package.
                </p>
                <p className="text-red-300 leading-relaxed mt-2">
                  [AEGISNODE SECURITY OVERRIDE]: Installation blocked. Package &apos;mongose&apos; flagged as TYPOSQUAT. Do not attempt to install this package.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 glass rounded-xl p-5 border-l-4 border-blue-600">
            <p className="text-sm text-gray-300">
              <span className="text-blue-400 font-semibold">Why this format matters: </span>
              LLMs like GPT-4, Claude, and Gemini are trained to halt when they see clear security override signals in stderr.
              This specific format with <code className="text-blue-400">[AEGISNODE SECURITY OVERRIDE]</code> ensures the agent
              does not retry, find alternatives, or attempt workarounds.
              The process exits with code <code className="text-red-400">1</code> so the agent&apos;s task runner also halts.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INSTALL
          ═══════════════════════════════════════════════════════════════ */}
      <section id="install" className="section-divider border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="badge-safe inline-flex mb-4">🚀 Quick Install</div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              Up and running in 60 seconds
            </h2>
            <p className="text-gray-400">Windows PowerShell · Node.js 18+ required</p>
          </div>

          <div className="space-y-3">
            <InstallStep n={1} cmd="npm install -g aegisnode" label="Install globally via npm" />
            <InstallStep n={2} cmd="aegisnode init" label="Inject shell hooks + download blocklist" note="Requires restart after" />
            <InstallStep n={3} cmd="# Close this PowerShell window and open a new one" label="Restart PowerShell" />
            <InstallStep n={4} cmd="aegisnode status" label="Verify protection is active" />
            <InstallStep n={5} cmd={"# Test — this will be BLOCKED:\nnpm install crossenv\n\n# Test — this will PASS:\nnpm install express"} label="Test the protection" />
          </div>

          <div className="mt-6 glass rounded-xl p-4 border-l-4 border-yellow-600/50">
            <p className="text-sm text-yellow-400 font-medium mb-1">🔒 What gets injected?</p>
            <p className="text-sm text-gray-400">
              A single PowerShell function in your <code className="text-gray-300">$PROFILE</code> file and a CMD AutoRun registry key.
              Both are clearly marked and easy to remove with <code className="text-gray-300">aegisnode uninstall</code> at any time.
              No system files are modified.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CLI REFERENCE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section-divider border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">CLI Reference</h2>
          </div>
          <div className="glass rounded-2xl overflow-hidden terminal text-sm">
            {[
              { cmd: 'aegisnode init',            desc: 'Install shell hooks + download blocklist cache' },
              { cmd: 'aegisnode init --force',    desc: 'Reinstall hooks (use after updates)' },
              { cmd: 'aegisnode status',          desc: 'Show protection status, cache info, Node environment' },
              { cmd: 'aegisnode update',          desc: 'Force-refresh blocklist from GitHub right now' },
              { cmd: 'aegisnode verify <package>',desc: 'Manually check any package name' },
            ].map((item, i) => (
              <div
                key={item.cmd}
                className={`flex items-start gap-4 px-5 py-4 ${i < 4 ? 'border-b border-white/[0.05]' : ''}`}
              >
                <code className="text-blue-400 font-mono whitespace-nowrap flex-shrink-0">{item.cmd}</code>
                <span className="text-gray-500 text-xs mt-0.5">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="section-divider border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center">
          <ShieldIcon className="w-16 h-16 text-blue-500/50 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Protect your next project
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            One command. No configuration. Works with every AI coding tool on Windows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#install" className="btn-primary text-base">
              Install AegisNode free <ArrowRight />
            </Link>
            <Link href="/docs" className="btn-secondary text-base">
              Read the docs
            </Link>
          </div>
          <p className="text-xs text-gray-700 mt-6">
            Free & open source. MIT License. No telemetry. No accounts required.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
