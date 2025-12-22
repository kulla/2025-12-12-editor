# Editor prototype

## Goal

Create a prototype of a web-based text WYSIWYG Editor with ProseMirror for rich-text editing capabilities. Features to include:

- [ ] Collaboration similar to https://github.com/kulla/2025-11-19-experiment-with-two-editor-instances
- [ ] Interactive exercises:
  - [ ] Fill-in-the-blanks
  - [ ] Multiple-choice questions
- [ ] ProseMirror elements:
  - [ ] Paragraphs
  - [ ] Headings
  - [ ] Lists
- [ ] Formatting:
  - [ ] Bold
  - [ ] Italic
- [ ] Toolbar
- [ ] Selection of one / multiple elements
- [ ] Insertions of elements via `/` + toolbar button
  - [ ] Insert ProseMirror elements
    - [ ] Use only configured elements
  - [ ] Insert interactive exercises
    - [ ] Split elements
    - [ ] Check which elements can be inserted

## Setup

1. Clone the repository
2. Install the dependencies via `bun install`

## Get started

Start the dev server:

```bash
bun dev
```

Build the app for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun preview
```

## Maintenance

Update dependencies:

```bash
bun update
```
