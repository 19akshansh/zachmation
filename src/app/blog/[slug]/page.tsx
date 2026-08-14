import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug, getPostTemplate } from "@/lib/blog";
import { TemplateImportCard } from "@/features/blog/components/templateImportCard";
import { blogMdxComponents } from "@/features/blog/components/mdxComponents";
import { Nav } from "@/components/layout/landing/nav";
import { CtaFooter } from "@/components/layout/landing/ctaFooter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://zachmation.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      type: "article",
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
      images: post.frontmatter.coverImage
        ? [post.frontmatter.coverImage]
        : ["/logo.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: post.frontmatter.coverImage
        ? [post.frontmatter.coverImage]
        : ["/logo.svg"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || post.frontmatter.draft) notFound();

  const template = post.frontmatter.template
    ? getPostTemplate(post.frontmatter.template)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    author: {
      "@type": "Person",
      name: post.frontmatter.author,
    },
    image: post.frontmatter.coverImage
      ? `${SITE_URL}${post.frontmatter.coverImage}`
      : `${SITE_URL}/logo.svg`,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to blog
          </Link>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {post.frontmatter.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>&middot;</span>
            <span>{post.frontmatter.author}</span>
          </div>

          {post.frontmatter.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-8" />

          {template && (
            <TemplateImportCard
              template={template}
              slug={slug}
              className="mb-10"
            />
          )}

          <div>
            <MDXRemote source={post.content} components={blogMdxComponents} />
          </div>
        </article>
      </main>
      <CtaFooter />
    </div>
  );
}
