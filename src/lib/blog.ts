import fs from "fs";
import matter from "gray-matter";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const TEMPLATES_DIR = path.join(process.cwd(), "content", "templates");

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  authorGithub?: string;
  tags: string[];
  template?: string;
  coverImage?: string;
  draft?: boolean;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
};

export type BlogPostSummary = Omit<BlogPost, "content">;

export type WorkflowTemplateExport = {
  name: string;
  tags: string[];
  nodes: unknown[];
  connections: unknown[];
};

export function getAllPosts(includeDrafts = false): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: data as BlogFrontmatter,
      content,
    };
  });

  return posts
    .filter((p) => includeDrafts || !p.frontmatter.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getAllPostSummaries(includeDrafts = false): BlogPostSummary[] {
  return getAllPosts(includeDrafts).map(({ slug, frontmatter }) => ({
    slug,
    frontmatter,
  }));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as BlogFrontmatter, content };
}

export function getPostTemplate(
  templateName: string,
): WorkflowTemplateExport | null {
  const filePath = path.join(TEMPLATES_DIR, `${templateName}.json`);
  if (!fs.existsSync(filePath)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[blog] Post references template "${templateName}" but ` +
          `content/templates/${templateName}.json was not found. ` +
          `The import card will not render for this post.`,
      );
    }
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as WorkflowTemplateExport;
}
