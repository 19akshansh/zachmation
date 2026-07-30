import Image from "next/image";
import { Bot, History, KeyRound, Network } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "./reveal";

const cards = [
  { icon: Network, title: "Visual workflow canvas", text: "Compose triggers, actions, AI steps, and integrations as a graph you can understand at a glance." },
  { icon: Bot, title: "AI-native nodes", text: "Use OpenAI, Anthropic, Gemini, Hugging Face, and Black Forest models inside the same automation graph." },
  { icon: KeyRound, title: "Credential management", text: "Keep service credentials separate from workflow logic and reuse configured connections across automations." },
  { icon: History, title: "Execution history", text: "Inspect runs, outputs, failures, and node-level execution details when an automation needs debugging." },
];

export function Features() {
  return <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
    <Reveal className="max-w-2xl"><span className="font-mono text-xs uppercase tracking-wide text-primary">Everything in one flow</span><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From trigger to result, visually.</h2><p className="mt-3 text-muted-foreground">Zachmation gives workflow logic, AI providers, external services, credentials, and run history a single home.</p></Reveal>
    <div className="mt-10 grid gap-4 md:grid-cols-2">{cards.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delayMs={i * 80}><Card className="h-full p-7 transition-transform hover:-translate-y-0.5"><Icon className="size-6 text-primary" /><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p></Card></Reveal>)}</div>
    <Reveal className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-2"><Image src="/landing/executions.gif" alt="Workflow execution history" width={1200} height={700} unoptimized className="w-full rounded-xl" /></Reveal>
  </section>;
}
