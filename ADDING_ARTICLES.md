# Adding a new article

## 1. Create the file

Add a file in `_posts/` named `YYYY-MM-DD-your-slug.html` (or `.md` for Markdown).

Example: `_posts/2026-07-01-mirai-botnet-analysis.html`

## 2. Add front matter

Every post must start with this YAML block:

```yaml
---
layout: post
title: "Mirai Botnet — Source Code Analysis"
date: 2026-07-01
tags: [malware, re]
lead: "One sentence displayed as a pull-quote under the title."
excerpt: "Longer summary shown on the home page and articles listing."
---
```

**Available tags:**

| Tag        | Theme group it appears in |
|------------|--------------------------|
| `malware`  | Malware Analysis         |
| `re`       | Malware Analysis         |
| `research` | Research                 |
| `project`  | Projects & Tools         |
| `tool`     | Projects & Tools         |

Use as many tags as apply: `tags: [malware, re, tool]`

## 3. Write the content

After the front matter, write your article body. The `post` layout automatically renders the title, date, tags, and lead — **don't repeat them** in the body.

### HTML post

```html
---
layout: post
title: "..."
...
---

<h2>Overview</h2>
<p>...</p>

<div class="bash-block">
  <div class="bash-bar">
    <span class="bash-dot" style="background:#b05555"></span>
    <span class="bash-dot" style="background:#c8953a"></span>
    <span class="bash-dot" style="background:#5a9e6f"></span>
    <span class="bash-title">doucky@analysis: ~/malware/sample</span>
  </div>
  <div class="bash-body">
    <div class="bash-line">
      <span class="b-prompt">
        <span class="b-user">doucky</span><span class="b-at">@</span><span class="b-host">analysis</span><span class="b-sep">:</span><span class="b-dir">~/malware/sample</span><span class="b-dollar">$</span><span class="b-cmd">file</span> sample.exe
      </span>
    </div>
    <div class="bash-out">sample.exe: PE32 executable ...</div>
  </div>
</div>

<figure class="article-figure">
  <img src="/img/sample/screenshot.png" alt="description" loading="lazy" />
  <figcaption><span class="fig-num">Fig. 1</span> — Caption text.</figcaption>
</figure>
```

### Markdown post (simpler, no custom components)

```markdown
---
layout: post
title: "..."
...
---

## Overview

Normal markdown prose, `inline code`, **bold**, links, etc.

Standard fenced code blocks work too:

```bash
$ strings sample.exe | grep -i http
```
```

## 4. Add images

Put images under `img/your-slug/`:

```
img/
  mirai-botnet-analysis/
    ida_main.png
    network_capture.png
```

Reference them in the post as `/img/your-slug/filename.png`.

## 5. Preview locally

```bash
bundle exec jekyll serve
```

Then open `http://localhost:4000`. The post will appear on the home page and in the articles listing automatically.
