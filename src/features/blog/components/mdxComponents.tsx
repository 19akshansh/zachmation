import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export const blogMdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-10 mb-4 text-2xl font-semibold tracking-tight sm:text-3xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-10 mb-4 text-xl font-semibold tracking-tight sm:text-2xl"
      {...props}
    />
  ),
  h3: (props) => <h3 className="mt-8 mb-3 text-lg font-semibold" {...props} />,
  p: (props) => <p className="mt-4 leading-7 text-foreground/90" {...props} />,
  a: ({ href = "", ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
        {...props}
      />
    );
  },
  ul: (props) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-6 marker:text-primary"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 marker:text-primary"
      {...props}
    />
  ),
  li: (props) => <li className="leading-7 text-foreground/90" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-primary/50 pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    const isFenced = Boolean(className);

    if (isFenced) {
      return <code className={className} {...props} />;
    }
    return (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
        {...props}
      />
    );
  },
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-lg border border-border/60 bg-card p-4 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border/60" />,
  strong: (props) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
};
