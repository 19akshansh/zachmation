import { Reveal } from "./reveal";
const steps = [
  ["Create a workflow", "Start with a manual, Google Forms, Stripe, or other trigger and lay out the flow on the canvas."],
  ["Connect services", "Add the credentials needed for Slack, Discord, AI providers, APIs, and other integrations."],
  ["Compose the logic", "Connect nodes, configure inputs, and combine external actions with AI-powered processing."],
  ["Run and inspect", "Execute the workflow and use execution history to understand outputs and diagnose failures."],
];
export function HowItWorks() { return <section id="how-it-works" className="border-y border-border/60 bg-muted/20"><div className="mx-auto max-w-6xl px-4 py-24 sm:px-6"><Reveal><span className="font-mono text-xs uppercase tracking-wide text-primary">How it works</span><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Automate in four steps.</h2></Reveal><ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], i) => <Reveal key={title} delayMs={i * 100}><li className="list-none"><span className="font-mono text-3xl font-semibold text-primary/40">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></li></Reveal>)}</ol></div></section>; }
