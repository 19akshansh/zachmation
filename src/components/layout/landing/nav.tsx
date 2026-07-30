import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Integrations", "#integrations"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Image src="/logo.svg" alt="Zachmation" width={32} height={32} />
          <span>Zachmation</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
