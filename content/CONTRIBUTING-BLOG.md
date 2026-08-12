# Writing a Blog Post / Template for Zachmation

Anyone can submit a tutorial or workflow template. Publishing works through
a normal GitHub pull request - that PR review _is_ the approval step, so
there's no separate admin panel to build or maintain.

## 1. Fork & branch

Fork the repo, create a branch like `blog/your-post-slug`.

## 2. Add your post

Create `content/blog/<your-slug>.mdx` with this frontmatter:

```mdx
---
title: "Your Post Title"
description: "One or two sentences - this becomes the meta description and OG preview."
date: "2026-08-12"
author: "Your Name"
authorGithub: "your-github-handle"
tags: ["templates", "integration-name"]
template: "your-template-slug" # omit this line if there's no attached workflow
draft: false
---

Your content in Markdown/MDX here.
```

- `date` uses `YYYY-MM-DD`.
- `template` must match a file in `content/templates/<template>.json` (see
  below) - leave it out entirely for posts with no attached workflow.
- Keep `draft: true` while you're still working on it locally; PRs should
  only be opened once it's `false`.

## 3. Attach a workflow template (optional but encouraged)

1. Build the workflow in Zachmation.
2. Use **Export** on the workflow - this produces a sanitized JSON export
   with no credentials included (see `src/features/workflows/lib/publicTemplate.ts`
   for exactly what gets stripped).
3. Save it as `content/templates/<your-template-slug>.json`.
4. Reference that slug in your post's `template:` frontmatter field.

## 4. Open a pull request

- Title it clearly, e.g. `blog: AI lead qualification with Gemini`.
- A maintainer will review for accuracy, tone, and that the attached
  template actually imports and runs. Merging the PR publishes the post -
  it'll appear on `/blog` and in the sitemap on the next deploy.

## Guidelines

- Write for someone who's never used Zachmation - explain what each node
  in your template does.
- Prefer real, runnable templates over screenshots.
- Add 2–5 relevant `tags` (used for future filtering).
- Don't include real API keys, tokens, or credential IDs anywhere in the
  post or template JSON.
