# LWDT Documentation Sources

All technical prose lives in Markdown. The React layer renders it and provides
navigation, search, theme selection, i18n switching, and interactive diagrams.

```text
src/content/
├── README.md          this file
├── docs.ts            imports Markdown per language and exposes DOCS[lang][id]
├── zh/                Simplified Chinese sources
└── en/                English sources
```

## Adding or editing a page

1. Create or edit `src/content/<lang>/<id>.md`.
2. Keep the file name identical across `zh/` and `en/` — the file name is the doc id.
3. Register the id in `src/i18n.ts` under `docs.sidebarGroups` to place it in the sidebar.
4. Use `##` and `###` for sections; the right-hand table of contents is generated from them.

Routes are derived from the doc id:

```text
src/content/zh/devicetree.md -> #/docs/devicetree
src/content/en/devicetree.md -> #/docs/devicetree (English UI)
```

## Markdown features supported

GitHub-flavored Markdown through `remark-gfm`, plus:

- fenced code blocks with a language label rendered above the code
- tables, task-free lists, inline code, links
- Docusaurus-style admonitions

```markdown
:::note[Optional title]
Supporting detail that should stand out from the body text.
:::

:::warning[Optional title]
A condition that can break the build or produce wrong hardware behaviour.
:::
```

Supported kinds: `note`, `info`, `tip`, `warning`, `danger`, `caution`.

## Porting to a real Docusaurus site

The Markdown files are intentionally plain. To move them into a Docusaurus
project:

1. Copy `src/content/<lang>/*.md` into `docs/` (default locale) and
   `i18n/<locale>/docusaurus-plugin-content-docs/current/` for other locales.
2. Add Docusaurus front matter to each file, for example:

   ```markdown
   ---
   id: devicetree
   title: Jsonnet Device Tree Format
   sidebar_position: 4
   ---
   ```

3. Translate the sidebar definition in `src/i18n.ts` into `sidebars.js`; group
   titles and labels map one to one.
4. Replace the `MARKDOWN SOURCE` badge in `src/pages/DocsPage.tsx` with the
   Docusaurus `Edit this page` / `Last updated` links if desired.

Admonition syntax is already Docusaurus-compatible, so those blocks can be
copied unchanged.
