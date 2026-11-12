"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChartNoAxesCombined, Layers, ArrowDownToLine, PencilLine, ScanLine } from "lucide-react";
const featureIcons = [BookOpen, ChartNoAxesCombined, Layers];
const stepIcons = [ArrowDownToLine, PencilLine, ScanLine];

const assets = "/landing/";
const metrics = [
  ["Net P&L", "+$8,240", "After fees & commissions"],
  ["Win rate", "62.5%", "75 wins / 120 trades"],
  ["Profit factor", "2.18", "Gross profit / gross loss"],
  ["Avg. risk / reward", "1 : 2.4", "Across closed trades"],
];
const workspaceLinks = [
  ["layoutdashboard", "Overview"], ["bookopen", "Trade journal"],
  ["chartnoaxescombined", "Analytics"], ["layers", "Setups"], ["calendardays", "Calendar"],
];
const pillars = [
  { icon: "bookopen", title: "Capture the whole trade.", copy: "Your entries, exits, and the thinking in between. Keep the context your broker leaves out." },
  { icon: "chartnoaxescombined", title: "Make your edge visible.", copy: "Go beyond win rate. Review how setups, trading hours, and risk decisions relate to your results." },
  { icon: "layers", title: "Repeat what works.", copy: "Use your checklist and reflections to bring one clear adjustment into your next session." },
];
const steps = [
  ["arrowdowntoline", "01 / RECORD", "Log the trade.", "Capture your entry, exit, initial stop, and fees. Tradebook calculates P&L and time in the trade."],
  ["pencilline", "02 / REFLECT", "Add the human part.", "Name the setup, save a chart, and record what you were thinking while the trade is fresh."],
  ["scanline", "03 / REFINE", "Find your next adjustment.", "Compare results by time and setup, then write down one change to try in your next session."],
];
const plans = [
  { id: "essentials", name: "Essentials", monthly: 19, copy: "Build a consistent review habit with the tools to capture and learn from each trade.", features: ["Trade entries and post-trade reflections", "Daily P&L and trade calendar", "Core performance dashboard", "Trade history and CSV export"] },
  { id: "pro", name: "Pro", monthly: 29, copy: "Get a deeper view of your trading process and performance.", features: ["Everything in Essentials", "Setup and time-of-day breakdowns", "Risk, drawdown, and expectancy metrics", "Checklist adherence and review targets"] },
] as const;
const questions = [
  ["Which instrument can I journal?", "This workspace is built for Micro E-mini Nasdaq-100 (MNQ) futures. It calculates P&L from price movement, direction, contract count, and fees."],
  ["How do I record my trades?", "Enter your trades in the journal and add a chart screenshot or notes for context. You can export your trade history as CSV and restore a full Tradebook backup."],
  ["What does the calendar show?", "Each trading day shows the number of trades and net P&L. Select a date to review its activity or start an entry."],
  ["How do I access my workspace?", "Use Log in to continue with your ChatGPT account. Access is governed by this Site’s sharing settings."],
  ["How are monthly and yearly prices shown?", "Prices are shown in US dollars. Monthly pricing displays the amount per month. Yearly pricing displays the full annual amount at the design’s 20% discount."],
  ["Does Tradebook place trades?", "Tradebook records and reviews your trading activity. It does not place orders."],
];

function Asset({ name, className }: { name: string; className?: string }) {
  // Figma exports retain their intrinsic SVG dimensions.
  return <img src={assets + name} alt="" className={className} />;
}

function Brand() {
  return <span className="tb-brand"><span className="tb-mark" aria-hidden="true"><i /><i /><i /></span> trade journal</span>;
}

function Dashboard() {
  return (
    <figure className="tb-demo">
      <div className="tb-dashboard">
        <aside className="tb-demo-side">
          <Brand />
          <div className="tb-demo-account"><b>JR</b><span>Alex’s workspace<small>Demo account</small></span></div>
          <ul>{workspaceLinks.map(([icon, label]) => <li key={icon}><Asset name={`8951-${icon}.svg`} />{label}</li>)}</ul>
          <div className="tb-demo-reminder"><Asset name="8951-sparkles.svg" /><strong>Your edge is in the details.</strong><small>Pick one trade to review today.</small></div>
          <small className="tb-demo-sync"><Asset name="8951-status.svg" /> Example workspace</small>
        </aside>
        <div className="tb-demo-main">
          <div className="tb-demo-head"><div><span className="tb-kicker">YOUR PERFORMANCE, IN PERSPECTIVE</span><h2>Overview</h2></div><span className="tb-demo-date"><Asset name="8988-calendar.svg" /> Oct 1–31 · Demo</span></div>
          <div className="tb-demo-metrics">
            {metrics.map(([label, value, caption]) => <div key={label} className="tb-glass tb-metric"><small>{label}</small><strong>{value}</strong><small>{caption}</small></div>)}
          </div>
          <div className="tb-demo-charts">
            <div className="tb-glass tb-demo-equity">
              <div className="tb-demo-label"><strong>Cumulative net P&L</strong><small>● Net equity</small></div>
              <div className="tb-plot"><div className="tb-axis"><span>$8k</span><span>$6k</span><span>$4k</span><span>$2k</span><span>$0</span></div><div className="tb-plot-grid"><Asset name="8988-equityarea.svg" /><Asset name="8988-equityline.svg" /></div></div>
              <div className="tb-plot-dates"><span>Oct 1</span><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Oct 31</span></div>
            </div>
            <div className="tb-glass tb-demo-setups">
              <strong>Your edge by setup</strong>
              {["Opening range breakout", "Pullback continuation", "Reversal fade"].map((setup, i) => <div key={setup}><small>{setup}<b>{["+$4,260", "+$2,810", "+$1,170"][i]}</b></small><progress value={[93, 65, 37][i]} max="100" aria-label={setup} /></div>)}
            </div>
          </div>
          <div className="tb-demo-trades"><strong>Recent trades</strong><div><span>MNQ</span><span>Long</span><span>Opening range breakout</span><b>+$156.00</b></div></div>
        </div>
      </div>
      <figcaption><span>◈ A clearer view of your trading.</span><span>Illustrative workspace · Sample trading data</span></figcaption>
    </figure>
  );
}

function FeatureSamples({ index }: { index: number }) {
  if (index === 0) return <div className="tb-mini"><div className="tb-demo-label"><strong>MNQ · LONG</strong><b>+$156.00</b></div><span className="tb-kicker">WHAT DID YOU DO WELL?</span><p>Waited for the retest. Kept my risk fixed.</p><small>✓ Followed the plan</small></div>;
  if (index === 1) return <div className="tb-mini"><span className="tb-kicker">P&L BY DAY OF WEEK</span><div className="tb-bars">{[28, 60, 80, 53, 29].map((height, i) => <div key={i}><span style={{ height }} /><small>{"MTWTF"[i]}</small></div>)}</div></div>;
  return <div className="tb-mini"><div className="tb-demo-label"><strong>Opening range breakout</strong><small>A+ SETUP</small></div>{["Opening range established", "Retest confirmed", "Risk defined before entry"].map(item => <p key={item}><Asset name="9099-circlecheck.svg" />{item}</p>)}</div>;
}

type BillingCycle = "monthly" | "yearly";

function Pricing({ unavailable, initialCycle }: { unavailable: boolean; initialCycle: BillingCycle }) {
  const [cycle, setCycle] = useState(initialCycle);
  return (
    <section className="tb-container tb-section tb-pricing" id="pricing">
      <span className="tb-kicker">INVEST IN YOUR PROCESS</span>
      <h2>One good habit. Lasting perspective.</h2>
      <p className="tb-muted">Compare the proposed subscription plans in USD.</p>
      <fieldset className="tb-billing">
        <legend className="tb-sr-only">Billing interval</legend>
        <label><input type="radio" name="billing" checked={cycle === "monthly"} onChange={() => setCycle("monthly")} />Monthly</label>
        <label><input type="radio" name="billing" checked={cycle === "yearly"} onChange={() => setCycle("yearly")} />Yearly <small>−20%</small></label>
      </fieldset>
      {unavailable && <p role="status" className="tb-checkout-note">Checkout is currently unavailable. No payment was taken.</p>}
      <div className="tb-plan-grid">
        {plans.map(plan => (
          <article key={plan.id} className={`tb-glass tb-plan ${plan.id === "pro" ? "tb-plan-pro" : ""}`}>
            <div className="tb-demo-label"><h3>{plan.name}</h3>{plan.id === "pro" && <span className="tb-plan-badge">THE FULL PICTURE</span>}</div>
            <p className="tb-price" aria-live="polite">${cycle === "monthly" ? plan.monthly : (plan.monthly * 12 * 0.8).toFixed(2)} <small>/ {cycle === "monthly" ? "month" : "year"}</small></p>
            <p className="tb-plan-copy">{plan.copy}</p>
            <a className={`tb-button ${plan.id === "pro" ? "tb-primary" : ""}`} href={`/subscribe/${plan.id}/${cycle}`}>Choose {plan.name}{plan.id === "pro" && <Asset name="8919-arrowupright.svg" />}</a>
            <ul>{plan.features.map(feature => <li key={feature}><Asset name={`9454-check${plan.id === "pro" ? "1" : ""}.svg`} />{feature}</li>)}</ul>
          </article>
        ))}
      </div>
      <p className="tb-pricing-foot"><Asset name="9454-check2.svg" /> The selected billing interval carries through to checkout.</p>
    </section>
  );
}

type LandingProps = {
  signedIn: boolean;
  signIn: string;
  checkoutUnavailable: boolean;
  initialCycle: BillingCycle;
};

export function Landing({ signedIn, signIn, checkoutUnavailable, initialCycle }: LandingProps) {
  useEffect(() => {
    const { hash } = window.location;
    if (["#dashboard", "#journal", "#history"].includes(hash)) {
      window.location.replace("/journal" + hash);
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll(".tb-section, .tb-end").forEach(el => { el.classList.add("tb-reveal"); observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="tb-landing" id="top">
      <a className="tb-skip" href="#content">Skip to content</a>
      <div className="tb-hero-shell">
        <div className="tb-atmosphere" aria-hidden="true" />
        <header className="tb-header">
          <nav className="tb-nav tb-container" aria-label="Main navigation">
            <div className="tb-account-links">
              {signedIn ? <><a className="tb-button tb-primary" href="/journal">Open journal</a></> : <><a href={signIn}>Log in</a><a className="tb-button tb-primary" href={signIn}>Sign up</a></>}
            </div>
            <div className="tb-page-links"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
            <a className="tb-wordmark" href="#top" aria-label="Trade Journal home"><Brand /></a>
          </nav>
        </header>
        <div className="tb-ticker" aria-hidden="true"><div className="tb-ticker-track">{[0,1].flatMap(n => ["Plan the trade", "Define your risk", "Capture your reasoning", "Review every session", "Build a repeatable process"].map(t => <span key={`${n}-${t}`}>{t}</span>))}</div></div>
        <main id="content">
          <div className="tb-container">
            <div className="tb-hero">
              <span className="tb-product-badge"><Asset name="8936-statusdot.svg" /> LESS NOISE. MORE EDGE.</span>
              <h1>Your next edge isn’t a trade.<br /><em>It’s a pattern.</em></h1>
              <p>Turn every trade into a lesson. Journal your decisions, uncover what works, and build a process you can repeat.</p>
              <div className="tb-hero-actions"><a className="tb-button tb-primary" href="#pricing">View subscriptions <Asset name="8919-arrowupright.svg" /></a><a className="tb-button" href="#product">Explore the platform</a></div>
              <small>Built for a more deliberate MNQ trading routine.</small>
            </div>
            <Dashboard />
          </div>
          <div className="tb-container tb-platform"><span>FROM THE TRADE TO THE REVIEW</span><div><strong>MNQ futures</strong><strong>Trade calendar</strong><strong>Chart screenshots</strong><strong>CSV export</strong></div></div>
          <section className="tb-container tb-section" id="product">
            <div className="tb-split-title"><div><span className="tb-kicker">YOUR PROCESS, CONNECTED</span><h2>More than a log.<br />Your trading operating system.</h2></div><p className="tb-muted">The numbers tell you what happened. The journal helps you understand why.</p></div>
            <div className="tb-three">{pillars.map((pillar, i) => <article className="tb-glass tb-feature" key={pillar.icon}><div className="tb-icon">{(() => { const Icon = featureIcons[i]; return <Icon aria-hidden="true" />; })()}</div><h3>{pillar.title}</h3><p>{pillar.copy}</p><FeatureSamples index={i} /></article>)}</div>
            <div className="tb-feature-foot"><span><Asset name="9099-tags.svg" /> Custom setup names</span><span><Asset name="9099-image.svg" /> Chart screenshots</span><span>◇ Private workspace</span></div>
          </section>
          <section className="tb-band" id="how-it-works">
            <div className="tb-container tb-section"><span className="tb-kicker">A BETTER DAILY RITUAL</span><h2>Trade. Reflect. Evolve.</h2><div className="tb-three tb-steps">{steps.map(([icon, label, title, copy], i) => <article key={icon}><div className="tb-step-head"><span className="tb-icon">{(() => { const Icon = stepIcons[i]; return <Icon aria-hidden="true" />; })()}</span><span className="tb-kicker">{label}</span></div><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
          </section>
          <section className="tb-container tb-section tb-insight">
            <div><span className="tb-kicker">SEE BENEATH THE P&L</span><h2>Your habits.<br />In high definition.</h2><p className="tb-muted">Your best trading hours. Your most reliable setups. See how risk, drawdown, and trade duration change as you build a trading routine.</p><ul>{["Compare results by setup and time of day", "Review risk, drawdown, and expectancy", "Check how consistently you followed your plan"].map(t => <li key={t}><Asset name="9214-check.svg" />{t}</li>)}</ul></div>
            <div className="tb-glass tb-heat"><span className="tb-kicker">ILLUSTRATIVE PERFORMANCE EXPLORER</span><h3>When is your edge strongest?</h3><div className="tb-heat-grid" aria-hidden="true"><span />{["MON", "TUE", "WED", "THU", "FRI"].map(day => <span key={day}>{day}</span>)}{[[4,5,8,4,5],[3,4,5,3,5],[2,3,4,2,3],[1,4,2,2,1],[4,3,2,5,2],[3,2,2,2,3]].flatMap((row, i) => [<span key={`row-${i}`}>{9 + i}:30</span>, ...row.map((shade, j) => <i key={`${i}-${j}`} style={{ backgroundColor: `rgb(112 106 231 / ${shade / 11})` }}>{i === 0 && j === 2 ? "+4.2R" : ""}</i>)])}</div><div className="tb-heat-note"><Asset name="9214-lightbulb.svg" /> Review your strongest sessions alongside sample size.</div></div>
          </section>
          <section className="tb-container tb-section tb-insight tb-reflection">
            <article className="tb-glass tb-trade-example"><div className="tb-demo-label"><h3>MNQ</h3><b>+$156.00</b></div><small>Sample trade · Opening range breakout</small><div className="tb-candles" aria-hidden="true">{[20,34,26,44,47,39,54,61,46,68,76,63,81,92,83,96,89,104].map((value, i) => <i key={i} style={{ bottom: value, height: 10 + (i % 4) * 4 }} />)}</div><span className="tb-kicker">WHAT DID I LEARN?</span><p>The first move wasn’t my trade. Waiting for the retest gave me a clearer entry and a defined stop.</p><small>✓ Reviewed</small></article>
            <div><span className="tb-kicker">CONTEXT IS YOUR ADVANTAGE</span><h2>The trade behind<br />the numbers.</h2><p className="tb-muted">A profitable trade can hide a rushed decision. Capture what you were thinking before and after execution so you can review both the decision and the result.</p><ul>{["Record your entry thesis and pre-trade checklist", "Save chart screenshots with your notes", "Write one action for the next trade"].map(t => <li key={t}><Asset name="9303-check.svg" />{t}</li>)}</ul><a className="tb-button" href={signedIn ? "/journal" : signIn}>Open your journal</a></div>
          </section>
          <Pricing unavailable={checkoutUnavailable} initialCycle={initialCycle} />
          <section className="tb-container tb-section tb-faq" id="faq"><div><span className="tb-kicker">A LITTLE MORE CLARITY</span><h2>Good questions.<br />Straight answers.</h2></div><div>{questions.map(([question, answer], i) => <details key={question} open={i === 0 ? true : undefined}><summary>{question}<Asset name="9539-plus.svg" className="tb-plus" /><Asset name="9539-minus.svg" className="tb-minus" /></summary><p>{answer}</p></details>)}</div></section>
          <section className="tb-container tb-end"><div className="tb-glass tb-end-card"><div><div className="tb-orbit" aria-hidden="true"><i/><i/><i/></div><span className="tb-kicker">YOUR NEXT CHAPTER STARTS HERE</span><h2>The market moves fast.<br />Build a process that lasts.</h2><p>Build a clearer picture of your trading, one review at a time.</p><a className="tb-button tb-primary" href="#pricing">Compare plans <Asset name="8919-arrowupright.svg" /></a></div></div></section>
        </main>
      </div>
      <footer className="tb-container tb-footer"><div><a href="#top"><Brand /></a><p>A clearer view of your trades.</p></div><nav aria-label="Footer navigation"><a href="#product">Product</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href={signedIn ? "/journal" : signIn}>Journal</a></nav><small>Tradebook · Built for deliberate trading.</small></footer>
    </div>
  );
}
