import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./reveal";

const faqs = [
  [
    "What can I automate?",
    "Workflows can combine triggers, HTTP requests, AI providers, Slack and Discord actions, payments, forms, and other supported nodes.",
  ],
  [
    "Which AI providers are supported?",
    "The project includes integrations for OpenAI, Anthropic, Gemini, Hugging Face, and Black Forest.",
  ],
  [
    "Can I inspect failed runs?",
    "Yes. Execution history is designed to expose workflow runs and their results so you can diagnose failures.",
  ],
  [
    "How are service credentials handled?",
    "Credentials are managed separately from workflow definitions, so configured connections can be selected where a node needs them.",
  ],
  [
    "Do I need a credit card to start?",
    "No. You can create an account and start with the free tier.",
  ],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <span className="font-mono text-xs uppercase tracking-wide text-primary">
          FAQ
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions, answered.
        </h2>
      </Reveal>
      <Reveal delayMs={100} className="mt-10">
        <Accordion type="single" collapsible>
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
