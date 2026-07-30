import Image from "next/image";
import { Reveal } from "./reveal";
const integrations = [
  "openai",
  "anthropic",
  "gemini",
  "discord",
  "slack",
  "stripe",
  "gforms",
  "huggingface",
  "blackforest",
];
export function Credentials() {
  return (
    <section
      id="integrations"
      className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-2"
    >
      <Reveal from="left">
        <span className="font-mono text-xs uppercase tracking-wide text-primary">
          Your services, your credentials
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Connect the tools your workflow already depends on.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Configure provider credentials once, then use them where needed across
          your workflows. Zachmation already supports a growing set of AI
          providers, communication tools, forms, payments, and HTTP-driven
          integrations.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {integrations.map((name) => (
            <div
              key={name}
              className="flex size-11 items-center justify-center rounded-lg border border-border bg-card"
            >
              <Image src={`/${name}.svg`} alt={name} width={24} height={24} />
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal from="right">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-2">
          <Image
            src="/landing/credentials.gif"
            alt="Credential management in Zachmation"
            width={960}
            height={600}
            unoptimized
            className="w-full rounded-xl"
          />
        </div>
      </Reveal>
    </section>
  );
}
