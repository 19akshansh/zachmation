import { ArrowRight, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return <section className="relative overflow-hidden">
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]" />
    <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <span className="inline-flex rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-xs text-muted-foreground">Visual automation, without the glue code</span>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">Build workflows that connect your apps, APIs, and AI.</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">Design automations on a visual canvas, securely connect your credentials, run AI and integration nodes, and inspect every execution from one place.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/signup">Build your first workflow <ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><a href="#how-it-works"><PlayCircle /> See how it works</a></Button></div>
        <p className="mt-4 text-xs text-muted-foreground">Start free. Connect only the services your workflow needs.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-2 shadow-2xl shadow-primary/10"><Image src="/landing/workflows.gif" alt="Zachmation visual workflow builder" width={960} height={600} unoptimized className="h-auto w-full rounded-xl" priority /></div>
    </div>
  </section>;
}
