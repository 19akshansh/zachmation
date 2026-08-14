import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Reveal } from "./reveal";

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-primary/20 bg-primary/10 px-8 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Turn repetitive work into a workflow.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Build visually, connect your services, and keep every execution
              inspectable.
            </p>
            <Button size="lg" className="mt-7" asChild>
              <Link href="/signup">
                Get started <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="Zachmation" width={28} height={28} />
            Zachmation
          </Link>
          <nav className="flex gap-5 text-sm text-muted-foreground">
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#faq">FAQ</a>
            <Link href="/blog">Blog</Link>
            <Link href="/signin">Sign in</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Zachmation
          </p>
        </div>
      </footer>
    </>
  );
}