# Developer Guide — doucky.github.io

This guide covers the project architecture, CSS/JS design decisions, and how to extend or modify the site.

---

## Table of contents

- [Developer Guide — doucky.github.io](#developer-guide--douckygithubio)
  - [Table of contents](#table-of-contents)
  - [1. Project structure](#1-project-structure)
  - [2. How Jekyll builds the site](#2-how-jekyll-builds-the-site)
  - [3. Layouts](#3-layouts)
    - [`_layouts/default.html`](#_layoutsdefaulthtml)
    - [`_layouts/post.html`](#_layoutsposthtml)
    - [`_layouts/page.html`](#_layoutspagehtml)
  - [4. Includes](#4-includes)
    - [`_includes/head.html`](#_includesheadhtml)
    - [`_includes/nav.html`](#_includesnavhtml)
    - [`_includes/footer.html`](#_includesfooterhtml)
  - [5. CSS architecture](#5-css-architecture)
    - [Design tokens](#design-tokens)
    - [Key CSS patterns](#key-css-patterns)
  - [6. JavaScript modules](#6-javascript-modules)
    - [`js/articles.js`](#jsarticlesjs)
    - [`js/code-peek.js`](#jscode-peekjs)
    - [`js/lightbox.js`](#jslightboxjs)
    - [`js/reading-progress.js`](#jsreading-progressjs)
    - [`js/toc.js`](#jstocjs)
  - [7. Data files](#7-data-files)
    - [`_data/tools.yml`](#_datatoolsyml)
    - [`_config.yml` themes](#_configyml-themes)
  - [8. Adding a new page](#8-adding-a-new-page)
  - [9. Adding a new layout](#9-adding-a-new-layout)
  - [10. Design tokens (CSS variables)](#10-design-tokens-css-variables)
  - [11. Per-page JS loading](#11-per-page-js-loading)
  - [12. Known quirks](#12-known-quirks)

---

## 1. Project structure

```
doucky.github.io/
├── _config.yml          # Site-wide config: title, url, permalink, themes
├── _data/
│   └── tools.yml        # Tools page data source
├── _includes/
│   ├── head.html        # <head> block: meta, CSS links
│   ├── nav.html         # Top navigation bar
│   └── footer.html      # Footer
├── _layouts/
│   ├── default.html     # Base layout (wraps all pages)
│   ├── post.html        # Article layout (extends default)
│   └── page.html        # Generic page layout (extends default)
├── _posts/              # Blog posts (YYYY-MM-DD-slug.md)
├── css/
│   ├── style.css        # Global styles, design tokens, nav, home, tools
│   ├── article.css      # Article page + articles listing page styles
│   └── syntax.css       # Rouge syntax highlighting (auto-generated theme)
├── js/
│   ├── articles.js      # Search + expand/collapse on /articles/
│   ├── code-peek.js     # Expandable code blocks with line preview
│   ├── lightbox.js      # Image lightbox on article pages
│   ├── reading-progress.js  # Scroll progress bar on article pages
│   └── toc.js           # Table-of-contents overlay on article pages
├── img/                 # Images, organised by article slug
├── docs/                # This documentation folder
├── index.html           # Home page (/)
├── articles.html        # Articles listing (/articles/)
├── tools.html           # Tools page (/tools/)
├── whoami.html          # About page (/whoami/)
├── 404.html             # Terminal-themed not-found page (GitHub Pages /404.html)
└── tags.html            # Tags index (/tags/) — lists all tags with posts
```

---

## 2. How Jekyll builds the site

Jekyll reads `_config.yml`, processes Liquid templates in all HTML/MD files, and outputs the static site to `_site/`. The `_site/` folder is what gets deployed to GitHub Pages.

Key config values in `_config.yml`:

```yaml
permalink: /articles/:slug/   # URL format for posts
themes:                        # Theme groups shown on /articles/
  - id: malware
    label: "Malware Analysis"
    tags: [malware, re]
```

`site.themes` is available in all Liquid templates, enabling the theme grouping on the articles page.

`site.posts` is the built-in Jekyll array of all posts, sorted newest-first.

---

## 3. Layouts

### `_layouts/default.html`

The root layout. Every page ultimately extends this. It renders:
- `_includes/head.html`
- `_includes/nav.html`
- `{{ content }}` (injected by Jekyll)
- `_includes/footer.html`
- Per-page JS via `page.page_js` front matter variable

**Per-page JS loading** is handled here:
```html
{% if page.page_js %}
<script src="/js/{{ page.page_js }}.js" defer></script>
{% endif %}
```

Set `page_js: articles` in a page's front matter to load `/js/articles.js`.

### `_layouts/post.html`

Extends `default`. Used by all blog posts. Renders:
- Back link to `/articles/`
- Prompt-line header (terminal aesthetic)
- Reading time estimate (calculated from word count ÷ 100)
- Tag badges
- Article title and lead
- `{{ content }}` (the post body)
- Related articles (posts sharing at least one tag, max 3)
- Prev/next navigation (`page.previous` / `page.next`)
- Footer with date

Also hardcodes four script tags (cannot be done via `page_js` because layout front matter variables are not exposed as `page.*`):
```html
<script src="/js/code-peek.js" defer></script>
<script src="/js/lightbox.js" defer></script>
<script src="/js/reading-progress.js" defer></script>
<script src="/js/toc.js" defer></script>
```

### `_layouts/page.html`

Minimal layout for static pages that don't need the full post structure.

---

## 4. Includes

### `_includes/head.html`

Loads the three CSS files unconditionally:
```html
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/article.css">
<link rel="stylesheet" href="/css/syntax.css">
```

All CSS is always loaded (no conditional loading). This keeps caching simple and avoids FOUC on navigation.

### `_includes/nav.html`

Renders the top nav. Active link detection uses `page.url`:
```liquid
{% if page.url == '/' %}class="active"{% endif %}
```

Links: home, articles, tools, whoami.

### `_includes/footer.html`

Static footer with author links from `_config.yml`.

---

## 5. CSS architecture

All styles are split across three files:

| File | Scope |
|---|---|
| `css/style.css` | Design tokens, web fonts (Inter via Google Fonts, JetBrains Mono via jsDelivr `@font-face`), global reset, typography, nav, home page, tools page, empty state, tag badges, `.link` utility |
| `css/article.css` | Article page layout, bash blocks, expandable code blocks, tool reference links, capability cards, kill chain, figures, prose tables, IOC tables, search bar, theme groups, lightbox, reading progress bar, table-of-contents overlay, tags page, related articles, prev/next nav, reading time |
| `css/syntax.css` | Rouge syntax highlighting (do not edit manually) |

### Design tokens

All colors and spacing are defined as CSS custom properties on `:root` in `style.css`. See §10 for the full list.

### Key CSS patterns

**Card components** — article cards and tool cards share a common structure: `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 4px`. Hover states use `var(--surface2)` background and `var(--text-faint)` border.

**Bash blocks** — `.bash-block` mimics a terminal window. Use `.bash-line`, `.b-prompt`, `.b-user`, `.b-host`, `.b-dir`, `.b-cmd`, `.b-flag`, `.b-arg`, `.b-out` span classes for coloured syntax inside commands.

**Expandable code block with preview (code-peek)** — `details.code-expand.code-peek` extends the base expandable block with a visible preview of the first few lines when collapsed. It requires `code-peek.js` (loaded on all article pages). The `<summary>` is built entirely by JS — you only write the outer `<details>` and the `.code-expand-body`. The preview clones the first N lines of the actual Rouge-highlighted block (syntax colors intact) and adds a gradient fade at the bottom edge. Leading whitespace common to all lines is stripped automatically so indentation introduced by HTML nesting doesn't appear. Supported `data-*` attributes:

| Attribute | Default | Purpose |
|---|---|---|
| `data-title` | _(none)_ | Filename shown in the header bar |
| `data-peek-lines` | `4` | Number of lines shown in the preview |

```html
<details class="code-expand code-peek" data-title="nanocore.cs" data-peek-lines="5">
  <div class="code-expand-body">
    {% highlight csharp %}
using System;
using NanoCore;
// full code here…
    {% endhighlight %}
  </div>
</details>
```

**Annotated hex dump** — `.hex-annotated` renders a hex blob where each byte (or group of bytes) wrapped in a `<span class="hx" data-tip="…">` shows a floating tooltip on hover/focus. Requires `hex-annotate.js` (loaded on all article pages). Use `.hx-ascii` for the trailing ASCII column (greyed, no tooltip). Optionally link several spans with matching `data-group="x"` so hovering any of them highlights the whole group. Escape quotes inside `data-tip` as `&quot;`.

```html
<div class="hex-annotated"><span class="hx" data-tip="Type ID of string">0C</span> <span class="hx" data-tip="Size of the string: 10 bytes">0A</span> <span class="hx" data-tip="Data: &quot;BufferSize&quot;">42 75 66 66 65 72 53 69 7A 65</span> <span class="hx" data-tip="Type ID of uint32">07</span> <span class="hx" data-tip="uint32 value = 65535">FF FF 00 00</span>  <span class="hx-ascii">..BufferSize.....</span></div>
```

**Supported Rouge language identifiers** — pass the identifier after `{% highlight … %}`. The most relevant ones for malware/RE work:

| Identifier | Language |
|---|---|
| `csharp` | C# |
| `python` | Python |
| `cpp` / `c` | C / C++ |
| `bash` / `shell` | Bash / Shell |
| `powershell` | PowerShell |
| `x86asm` / `nasm` | x86 Assembly |
| `java` | Java |
| `ruby` | Ruby |
| `javascript` / `js` | JavaScript |
| `yaml` | YAML |
| `json` | JSON |
| `xml` | XML |
| `ini` / `toml` | Config files |
| `plaintext` | No highlighting |

The full list (~200 languages) is at [rouge-ruby.github.io/doc/Rouge/Lexers](https://rouge-ruby.github.io/doc/Rouge/Lexers.html) or via `rougify list` in a terminal.

**Expandable code block (no preview)** — `details.code-expand` is a collapsible code container built on the native HTML `<details>`/`<summary>` element, so it needs **no JavaScript**. The `<summary>` is the clickable header bar (terminal-styled); a `▶` marker rotates on open and a `.code-expand-hint` span auto-shows `expand`/`collapse` via CSS. The code goes in a `.code-expand-body` wrapper, which strips margins/backgrounds off any nested `<pre>` or Rouge `.highlight`. To put a markdown fenced block inside, add `markdown="1"` on the body so kramdown parses it; otherwise drop in a raw `<pre>`. Example:

```html
<details class="code-expand">
  <summary>config.py <span class="code-expand-hint"></span></summary>
  <div class="code-expand-body" markdown="1">

```python
HOST = "10.0.0.1"
PORT = 4444
```

  </div>
</details>
```

**Links** — inside `.article-content`, all links (`<a>`) are auto-styled amber with a soft underline that intensifies on hover — no class needed. Since kramdown runs with `input: GFM`, a bare URL pasted into a post is auto-linkified and picks up this style automatically. Outside article content (custom pages, layouts), apply the reusable `.link` utility class (defined in `style.css`) to any `<a>` to get the same amber link style. Example: `<a class="link" href="https://example.com">example.com</a>`.

**Prose headings** — inside `.article-content`, all six markdown heading levels are auto-styled (mono) in a descending size scale: `#` h1 1.35rem → `##` h2 1rem → `###` h3 0.92rem → `####` h4 0.82rem → `#####` h5 0.74rem (uppercase) → `######` h6 0.68rem (uppercase). h2 is the terminal "section label" style (uppercase, letter-spaced, dim, with a trailing rule line) and is kept as the largest level so the scale stays `## > ### > ####`; h3 keeps an amber `#` prefix injected via CSS (don't type the `#` yourself). Posts normally start at `##`. Just write normal markdown headings; no classes needed.

**Other markdown elements** — `.article-content` also styles the remaining markdown output so plain markdown "just works": `em`/`i` (italic), `strong`/`b`, `~~del~~`/`s` (struck, faint), `mark` (amber highlight), `> blockquote` (amber left border on a surface), `---` `hr`, bare images (`p img` — bordered; figures use `.article-figure` instead), kramdown definition lists (`dt`/`dd`), and GFM task-list checkboxes (amber `accent-color`). Inline `code`, fenced code blocks, links, and tables are covered by their own patterns above.

**Tables** — plain markdown (GFM) tables inside `.article-content` are auto-styled (mono uppercase headers, bordered rows, hover highlight) — just write a normal markdown table, no classes needed. They scroll horizontally on narrow screens. For a key/value IOC layout with labels down the first column, use the raw-HTML `.ioc-table` variant instead (wrap it in `.ioc-table-wrap`); its first `<td>` is dimmed and fixed-width (110px). Example markdown table:

```markdown
| Type   | Indicator                          | Note        |
|--------|------------------------------------|-------------|
| SHA256 | `a1b2c3…`                          | Dropper     |
| C2     | `10.0.0.1:4444`                    | HTTP/S      |
| Mutex  | `Global\NanoCore`                  | Persistence |
```

And the raw-HTML `.ioc-table` variant:

```html
<div class="ioc-table-wrap">
  <table class="ioc-table">
    <thead>
      <tr><th>Type</th><th>Indicator</th></tr>
    </thead>
    <tbody>
      <tr><td>SHA256</td><td><code>a1b2c3…</code></td></tr>
      <tr><td>C2</td><td><code>10.0.0.1:4444</code></td></tr>
      <tr><td>Mutex</td><td><code>Global\NanoCore</code></td></tr>
    </tbody>
  </table>
</div>
```

**Capability cards** — `.cap-grid` is a responsive grid (`auto-fit, minmax(200px, 1fr)`) of `.cap-card` blocks for presenting a malware's capabilities by category. Each card carries a color modifier which sets the `--cap` custom property driving the left accent bar, category label, and icon. Available colors: `.cap-red`, `.cap-green`, `.cap-blue`, `.cap-amber`, `.cap-purple`, `.cap-teal`, `.cap-pink`, `.cap-orange` (all defined as tokens in `style.css`). Suggested convention: red = defense evasion / anti-analysis, green = persistence, blue = C2 / network, amber = exfiltration, purple = discovery, teal = collection, pink = credential access, orange = execution. Structure: `.cap-card-head` (holds `.cap-card-icon` and `.cap-card-cat`), then `.cap-card-title` and `.cap-card-desc`. The icon slot takes any glyph (the site has no icon font loaded — use a unicode symbol or inline SVG). Example:

```html
<div class="cap-grid">
  <div class="cap-card cap-red">
    <div class="cap-card-head">
      <span class="cap-card-icon">⊘</span>
      <span class="cap-card-cat">Évasion</span>
    </div>
    <div class="cap-card-title">Anti-analyse</div>
    <div class="cap-card-desc">Détecte VM, debuggers et sandbox.</div>
  </div>
  <div class="cap-card cap-blue">
    <div class="cap-card-head">
      <span class="cap-card-icon">⇄</span>
      <span class="cap-card-cat">C2</span>
    </div>
    <div class="cap-card-title">Canal chiffré</div>
    <div class="cap-card-desc">HTTP/S, payload en DES.</div>
  </div>
</div>
```

**Kill chain** — `.kill-chain` is a vertical execution timeline of `.kc-step` items, auto-numbered via a CSS counter (no numbers in markup) and joined by a connector line drawn off each `.kc-num`. Each step takes a color modifier setting `--kc` for the numbered circle. Available colors: `.kc-red`, `.kc-green`, `.kc-blue`, `.kc-amber`, `.kc-purple`, `.kc-teal`, `.kc-pink`, `.kc-orange`. Structure per step: `.kc-num` (empty — the number is injected by CSS) and a `.kc-body` holding `.kc-title` and `.kc-desc`. Order the steps to follow the attack flow (dropper → persistence → C2 → exfiltration). Example:

```html
<div class="kill-chain">
  <div class="kc-step kc-red">
    <div class="kc-num"></div>
    <div class="kc-body"><div class="kc-title">Dropper / déballage</div><div class="kc-desc">Charge utile déchiffrée en mémoire.</div></div>
  </div>
  <div class="kc-step kc-green">
    <div class="kc-num"></div>
    <div class="kc-body"><div class="kc-title">Persistance</div><div class="kc-desc">Tâche planifiée + clé de registre Run.</div></div>
  </div>
  <div class="kc-step kc-blue">
    <div class="kc-num"></div>
    <div class="kc-body"><div class="kc-title">Beacon C2</div><div class="kc-desc">Connexion HTTP/S vers le serveur.</div></div>
  </div>
</div>
```

**Figures** — wrap an image in `<figure class="article-figure">` with an `<img>` and a `<figcaption>`. The `Fig. N — ` prefix is generated automatically: `.article-content` resets a `figure` CSS counter and each `.article-figure` increments it, so write only the caption text (no number, no leading dash). Numbering follows document order and resets per article. Clicking the image opens the lightbox (see `lightbox.js`). Example:

```html
<figure class="article-figure">
  <img src="/img/slug/file.png" alt="..." loading="lazy" />
  <figcaption>Resource entropy graph.</figcaption>
</figure>
```

The legacy `.fig-num` span is no longer needed (kept only for manual overrides).

**Tool reference link** — `a.tool-ref` is a fully clickable card for linking out to a tool from inside article content (defined in `article.css`). The whole `<a>` is the link, with an amber accent bar and `var(--surface2)` background on hover, matching the card pattern above. It holds three spans: `.tool-ref-title` (mono, amber; a `⎋` icon is prepended via CSS), `.tool-ref-desc` (dim description), and `.tool-ref-url` (faint mono URL). Distinct from the tools-page `.tool-card` (a `<div>`) and its inner `.tool-link`. Because it is an `<a>`, never nest other links inside it (see §12). Example:

```html
<a class="tool-ref" href="https://github.com/doucky/yara-gen" target="_blank" rel="noopener">
  <span class="tool-ref-title">YARA Rule Generator</span>
  <span class="tool-ref-desc">Auto-generates YARA rules from a sample.</span>
  <span class="tool-ref-url">github.com/doucky/yara-gen</span>
</a>
```

**Tag badges** — `.card-tag` sets base badge styles. Each tag gets a modifier class `tag-{name}` (e.g., `.tag-malware`) that sets the specific color. Add new tag colors in `style.css` near the existing `.card-tag` rules.

**Lightbox** — `#lb-overlay` is injected into `<body>` by `lightbox.js` on first image click. Controlled by toggling `.lb-visible` class.

**Reading progress bar** — `#reading-progress` is injected by `reading-progress.js`. Positioned `fixed` at `top: 52px` (just below the nav bar height).

---

## 6. JavaScript modules

### `js/articles.js`

Loaded only on `/articles/` via `page_js: articles` front matter.

Responsibilities:
- **Expand/collapse** theme groups beyond 3 articles (`.theme-show-more` button)
- **Hash-based expansion** — `#theme-malware` in the URL auto-expands that group on load
- **Search** — filters `.theme-article-link` elements by `data-title` attribute, highlights matches with `<mark class="search-highlight">`, shows result count, hides empty groups, shows a "no results" message

Keyboard shortcuts:
- `/` focuses the search input from anywhere on the page
- `Escape` clears the search and blurs the input

### `js/code-peek.js`

Loaded on all article pages (hardcoded in `_layouts/post.html`).

Initialises every `details.code-peek` element that doesn't already have a `<summary>`. For each one it:
1. Reads `data-title` and `data-peek-lines` (default 4).
2. Finds the first `.highlight` or `<pre>` inside `.code-expand-body`.
3. Clones it, strips any Rouge line-number table wrapper, removes the common leading whitespace from all lines, then trims to the requested number of lines.
4. Builds a `<summary>` containing a `.ce-bar` (arrow ▶ + title + expand/collapse hint) and a `.ce-preview` (the cloned block + a `.ce-fade` gradient overlay).
5. Inserts the summary before the body.

CSS in `article.css` handles the rest: `.ce-preview` is hidden when `[open]`, the ▶ arrow rotates 90° on open, and `.ce-fade` is a gradient from transparent to `var(--surface)`.

### `js/lightbox.js`

Loaded on all article pages (hardcoded in `_layouts/post.html`).

Attaches a `click` listener to every `.article-figure img`. On click, injects `#lb-overlay` into `<body>` (once), sets the image src and caption, and toggles `.lb-visible`. Closes on `Escape` or click outside the image.

### `js/reading-progress.js`

Loaded on all article pages (hardcoded in `_layouts/post.html`).

Injects `#reading-progress` (a 2px amber bar) fixed below the nav. Updates its `width` percentage on every `scroll` event using `window.scrollY / (scrollHeight - clientHeight)`.

### `js/toc.js`

Loaded on all article pages (hardcoded in `_layouts/post.html`).

Builds a clickable table-of-contents overlay from the `h2`/`h3` headings inside `.article-content`. Does nothing if there are fewer than two headings. Steps:
- Ensures every heading has an `id` (slugifies its text if kramdown didn't already add one), so links resolve.
- Injects a fixed `#toc-toggle` button (bottom-right) and a hidden `#toc-overlay` containing `#toc-panel` > `#toc-list`. Each entry is a `.toc-link` (with a `.toc-h2`/`.toc-h3` level modifier for indentation).
- Clicking the toggle opens the overlay; clicking a link smooth-scrolls to the heading, updates the URL hash, and closes it. Closes on `Escape`, on the `×` button, or on a click outside the panel.
- A `scroll` listener adds `.toc-active` (amber) to the link of the section currently in view. Headings get `scroll-margin-top: 70px` in CSS so they clear the sticky nav.

---

## 7. Data files

### `_data/tools.yml`

Array of tool objects. Fields: `name`, `description`, `url`, `lang`, `tags`, `status`.

Consumed by `tools.html` via `site.data.tools`. Adding a new tool requires only editing this YAML file — no HTML changes needed.

### `_config.yml` themes

The `themes` array drives the grouping logic on `/articles/`. Each theme has an `id` (used as CSS class and HTML anchor), a `label` (displayed heading), and a `tags` list. A post is included in a theme if any of its tags appear in that theme's `tags` list.

---

## 8. Adding a new page

1. Create `yourpage.html` at the root:

```html
---
layout: default
title: yourpage
permalink: /yourpage/
---
<div class="container">
  <header class="page-header">
    <div class="prompt-line">
      <span class="p-user">doucky</span><span style="color:var(--text-faint)">@</span><span class="p-host">github.io</span><span style="color:var(--text-faint)">:</span><span class="p-dir">~/</span><span style="color:var(--text-faint)">$ cat yourpage</span>
    </div>
    <h1>Page <span class="accent">title.</span></h1>
    <p>Subtitle description.</p>
  </header>

  <section class="section">
    <!-- content -->
  </section>
</div>
```

2. Add the nav link in `_includes/nav.html`:

```html
<li><a href="/yourpage/" {% if page.url contains '/yourpage' %}class="active"{% endif %}>yourpage</a></li>
```

3. If the page needs its own JS, create `js/yourpage.js` and add `page_js: yourpage` to the front matter.

---

## 9. Adding a new layout

Create `_layouts/yourlayout.html`. To extend `default`:

```html
---
layout: default
---
<!-- your layout-specific HTML wrapping {{ content }} -->
<main class="container">
  {{ content }}
</main>
```

Use it in a page or post with `layout: yourlayout`.

---

## 10. Design tokens (CSS variables)

Defined on `:root` in `css/style.css`:

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#0d0f0e` | Page background |
| `--surface` | `#111413` | Card backgrounds |
| `--surface2` | `#161918` | Hover state backgrounds, bash bar |
| `--border` | `#222725` | All borders |
| `--text` | `#d4d8d4` | Primary text |
| `--text-dim` | `#aab3ad` | Secondary text, article prose |
| `--text-faint` | `#4a534f` | Placeholder text, timestamps, labels |
| `--amber` | `#c8953a` | Accent color (links, highlights, progress bar) |
| `--green` | `#5a9e6f` | Terminal user color |
| `--blue` | `#4a90b8` | Terminal host color |
| `--red` | `#b05555` | Error color |
| `--purple` | `#8a73b8` | Capability/kill-chain category color |
| `--teal` | `#4f9e94` | Capability/kill-chain category color |
| `--pink` | `#b06a93` | Capability/kill-chain category color |
| `--orange` | `#c4774a` | Capability/kill-chain category color |
| `--font-mono` | `'JetBrains Mono', monospace` | Monospace font stack |
| `--font-sans` | `'Inter', system-ui, sans-serif` | Sans-serif font stack |
| `--gap` | `2rem` | Standard spacing unit |

---

## 11. Per-page JS loading

`default.html` conditionally loads one JS file based on the `page_js` front matter key:

```liquid
{% if page.page_js %}
<script src="/js/{{ page.page_js }}.js" defer></script>
{% endif %}
```

Set `page_js: articles` in a page to load `/js/articles.js`.

**Important limitation:** this mechanism does not work from within layout files. Jekyll does not expose layout front matter as `page.*` variables. Scripts needed by a layout (like `lightbox.js` on `post.html`) must be hardcoded as `<script>` tags directly in the layout file itself.

---

## 12. Known quirks

**Nested `<a>` tags are invalid HTML.** Article cards (`.article-card`) are `<a>` elements. Do not put clickable tag badges or other links inside them — use `<span>` instead. The home page and article cards use `<span class="card-tag">` for this reason.

**Bash heredoc writes are more reliable than direct file edits in some environments.** If you encounter a situation where edits to files don't reflect in the built site, write the file content via a bash heredoc (`cat > file.html << 'EOF'`) rather than in-place editing.

**Jekyll `page.*` vs `layout.*`:** Variables set in a layout's front matter are accessible as `layout.*`, not `page.*`. Only variables set in the content page's own front matter are available as `page.*`. This is why `page_js` must be set in each page file, not in the layout.

**`_site/` is generated — never edit it directly.** All changes must be made to source files; `_site/` is overwritten on every build.

**Box-drawing tables in code blocks need the full mono font.** capa/CLI output uses heavy box-drawing glyphs (`┏ ━ ┃ ┡ ╇ ┩`). Google Fonts only serves Latin/Cyrillic/Greek subsets of JetBrains Mono, which omit these glyphs — the browser then falls back to a different mono font whose character width differs, so columns drift out of alignment. Fix: JetBrains Mono is loaded via `@font-face` from jsDelivr (`cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/...`, full Unicode coverage) in `style.css`, while Inter still comes from Google Fonts. Code blocks (`.article-content .highlight, pre`) also disable ligatures and use `line-height: 1.45` so the box characters align horizontally and connect vertically. If you ever pin a new font version, keep all four weights (300/400/500/700).
