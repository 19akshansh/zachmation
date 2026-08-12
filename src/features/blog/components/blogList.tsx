"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { badgeVariants } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { BlogPostSummary } from "@/lib/blog";
import { BlogPostCard } from "./blogPostCard";

const PAGE_SIZE = 6;

export function BlogList({ posts }: { posts: BlogPostSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeTags, setActiveTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) ?? [],
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const post of posts) {
      for (const tag of post.frontmatter.tags ?? []) set.add(tag);
    }
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesQuery =
        q.length === 0 ||
        post.frontmatter.title.toLowerCase().includes(q) ||
        post.frontmatter.description.toLowerCase().includes(q);

      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => post.frontmatter.tags?.includes(tag));

      return matchesQuery && matchesTags;
    });
  }, [posts, query, activeTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [query, activeTags]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (activeTags.length > 0) params.set("tags", activeTags.join(","));
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, activeTags, currentPage, pathname, router]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const hasActiveFilters = query.trim().length > 0 || activeTags.length > 0;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-9"
            aria-label="Search blog posts"
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={isActive}
                className={cn(
                  badgeVariants({ variant: isActive ? "default" : "outline" }),
                  "cursor-pointer transition-colors",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {filtered.length} post{filtered.length === 1 ? "" : "s"}
        {hasActiveFilters ? " matching your filters" : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted-foreground">
          No posts match your search or filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {paged.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={n === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(n);
                  }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
