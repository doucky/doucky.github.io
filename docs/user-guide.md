# User Guide — Publishing content on doucky.github.io

This guide covers everything needed to publish and manage content on the blog, without touching the codebase.

---

## Table of contents

1. [Publishing an article](#1-publishing-an-article)
2. [Available tags](#2-available-tags)
3. [Adding a new tag](#3-adding-a-new-tag)
4. [Adding images to an article](#4-adding-images-to-an-article)
5. [Adding a tool](#5-adding-a-tool)
6. [Previewing locally](#6-previewing-locally)

---

## 1. Publishing an article

Create a file in `_posts/` following this naming convention:

```
_posts/YYYY-MM-DD-your-slug.md
```

Example: `_posts/2026-07-01-mirai-botnet-analysis.md`

Every post starts with a **front matter** block:

```yaml
---
layout: post
title: "Mirai Botnet — Source Code Analysis"
date: 2026-07-01
tags: [malware, re]
lead: "One-sentence teaser shown under the title on the article page."
excerpt: "Longer summary shown on the home page and articles listing."
---
```

| Field | Required | Description |
|---|---|---|
| `layout` | ✅ | Always `post` |
| `title` | ✅ | Article title |
| `date` | ✅ | Must match the filename date |
| `tags` | ✅ | At least one tag (see §2) |
| `lead` | optional | Pull-quote under the title |
| `excerpt` | optional | Card preview on home/articles pages |

After the front matter, write the article body in Markdown:

```markdown
---
layout: post
title: "Mirai Botnet — Source Code Analysis"
date: 2026-07-01
tags: [malware, re]
lead: "..."
excerpt: "..."
---

## Overview

Normal prose, **bold**, `inline code`, [links](https://example.com).

## Command example

Use standard fenced code blocks for commands:

```bash
$ strings mirai.elf | grep -i http
```

The post layout automatically adds the title, date, tags badge, reading time, and the prev/next navigation — don't repeat them in the body.

---

## 2. Available tags

Tags control which theme group an article appears under on the `/articles/` page.

| Tag | Theme group |
|---|---|
| `malware` | Malware Analysis |
| `re` | Malware Analysis |
| `research` | Research |
| `project` | Projects & Tools |
| `tool` | Projects & Tools |

Use multiple tags when relevant: `tags: [malware, re]`

---

## 3. Adding a new tag

Tags are mapped to theme groups in `_config.yml`. To add a new tag, either:

**Option A — Add it to an existing theme group:**

Open `_config.yml` and append your tag to the `tags` list of the relevant theme:

```yaml
themes:
  - id: malware
    label: "Malware Analysis"
    tags: [malware, re, your-new-tag]   # ← add here
```

**Option B — Create a new theme group:**

```yaml
themes:
  - id: detection
    label: "Detection Engineering"
    tags: [detection, sigma, yara]
```

Then use the new tag in your article front matter: `tags: [detection, sigma]`

The tag badge color is set by a CSS rule in `css/style.css`. Add one if you want a distinct color:

```css
.tag-detection { background: rgba(100, 160, 200, 0.12); color: #64a0c8; border-color: rgba(100, 160, 200, 0.25); }
```

---

## 4. Adding images to an article

Place images in a subfolder of `img/` named after your article slug:

```
img/
  mirai-botnet-analysis/
    source_main.png
    network_capture.png
```

Reference them in the article using the full path from root:

```markdown
![description](/img/mirai-botnet-analysis/source_main.png)
```

Or use the styled figure component (HTML posts only), which supports the lightbox click-to-zoom:

```html
<figure class="article-figure">
  <img src="/img/mirai-botnet-analysis/source_main.png" alt="IDA Pro — main function" loading="lazy" />
  <figcaption><span class="fig-num">Fig. 1</span> — Main function decompiled in IDA Pro.</figcaption>
</figure>
```

Images inside `.article-figure` are clickable and open in a lightbox overlay.

---

## 5. Adding a tool

Tools are listed on `/tools/` and managed in a single data file: `_data/tools.yml`.

Add an entry at the bottom of the file:

```yaml
- name: my-tool
  description: "Short description of what it does."
  url: "https://github.com/doucky/my-tool"
  lang: Python
  tags: [yara, static]
  status: active   # active | wip | archived
```

| Field | Description |
|---|---|
| `name` | Tool name (also used as the card heading) |
| `description` | One-line description |
| `url` | Link to GitHub repo or project page |
| `lang` | Primary language |
| `tags` | Free-form list of keywords shown as badges |
| `status` | `active`, `wip`, or `archived` |

The tool card appears immediately after a `bundle exec jekyll serve` rebuild.

---

## 6. Previewing locally

```bash
# First time only
bundle install

# Start the server
bundle exec jekyll serve --livereload

# Open
open http://localhost:4000
```

The server watches for file changes and rebuilds automatically. The `--livereload` flag refreshes the browser tab on each rebuild.

To check that your article will build correctly before pushing:

```bash
bundle exec jekyll build
```

Any front matter errors or Liquid template issues will appear in the terminal output.
