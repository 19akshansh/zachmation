import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPostSummary } from "@/lib/blog";

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full p-7 transition-transform group-hover:-translate-y-0.5">
        <p className="text-xs text-muted-foreground">
          {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &middot; {post.frontmatter.author}
        </p>
        <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">
          {post.frontmatter.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {post.frontmatter.description}
        </p>
        {post.frontmatter.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.frontmatter.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Read post <ArrowRight className="size-3.5" />
        </span>
      </Card>
    </Link>
  );
}
