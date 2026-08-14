import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllPostSummaries } from "@/lib/blog";
import { Nav } from "@/components/layout/landing/nav";
import { CtaFooter } from "@/components/layout/landing/ctaFooter";
import { Reveal } from "@/components/layout/landing/reveal";
import { BlogList } from "@/features/blog/components/blogList";

export const metadata: Metadata = {
  title: "Blog & Templates",
  description:
    "Tutorials, guides, and ready-to-import workflow templates for building AI automations with Zachmation.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostSummaries();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wide text-primary">
              Learn &amp; build
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Blog &amp; Templates
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tutorials and ready-to-import workflow templates from the
              Zachmation community.
            </p>
          </Reveal>

          {posts.length === 0 ? (
            <p className="mt-16 text-muted-foreground">
              No posts published yet - check back soon.
            </p>
          ) : (
            <div className="mt-12">
              <Suspense fallback={null}>
                <BlogList posts={posts} />
              </Suspense>
            </div>
          )}
        </section>
      </main>
      <CtaFooter />
    </div>
  );
}
