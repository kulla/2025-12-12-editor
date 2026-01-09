# Agent Guide for Editor Prototype

This document provides essential guidelines for AI coding agents working in this repository.

## Project Overview

A web-based WYSIWYG editor prototype built with React, ProseMirror, and Loro CRDT for collaborative editing. The project uses a schema-driven architecture with flat node storage for efficient CRDT operations.

## Commands

### Package Manager
This project uses **Bun** as the package manager and runtime.

### Development
```bash
bun dev              # Start development server with hot reload
bun run build        # Build for production
bun preview          # Preview production build locally
```

### Code Quality
```bash
bun check            # Run Biome linter and formatter (auto-fix)
bun run format       # Format code only
bun run tsc --noEmit # Type-check TypeScript without emitting files
```

### Testing
Currently no test suite is configured. This repo represents a technical prototype and therefore no tests should be added.

### CI Checks
All pull requests must pass:
1. `bun run build` - Build succeeds
2. `bun check` - Biome linting passes
3. `bun run tsc --noEmit` - TypeScript type checking passes

## Architecture

### Key Concepts
- **Schema System**: Type-safe schema definitions in `src/schema/`
- **Flat Nodes**: CRDT-friendly flat storage structure in `src/nodes/flat.ts`
- **Nested Nodes**: Hierarchical representation in `src/nodes/nested.ts`
- **Editor Store**: Central state management using Loro CRDT in `src/store/editor-store.ts`
- **Operations**: Load/save/render operations in `src/operations/`

### Directory Structure
```
src/
├── schema/          # Schema definitions and types
├── nodes/           # Node representations (flat/nested)
├── store/           # State management with Loro CRDT
├── operations/      # Core operations (load, save, render)
├── rich-text/       # ProseMirror integration
├── content/         # Content definitions and initial state
└── utils/           # Utility functions (guards, branded types, etc.)
```

## Code Style

### Formatting (Biome)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: As needed (ASI-aware)
- **Line length**: No strict limit, but keep readable
- Run `bun check` before committing to auto-fix issues

### Imports
- **Organization**: Biome automatically organizes imports
- **Style**: ES modules only (`import`/`export`)
- **Order**: External packages first, then relative imports
- **Grouping**: Group by blank lines (packages, then local)
- **Extensions**: Use `.ts`/`.tsx` extensions in imports (allowed by tsconfig)

Example:
```typescript
import { invariant } from 'es-toolkit'
import { LoroDoc, LoroList } from 'loro-crdt'

import type { Schema } from '../schema/types'
import { isKey } from './key'
```

### TypeScript

#### Type Safety
- **Strict mode enabled**: All strict checks on
- **No implicit any**: Always provide explicit types
- **No unused locals/parameters**: Clean up unused code
- **Prefer type over interface**: Use `type` for type aliases, `interface` for object shapes
- **Use branded types**: For semantic type safety (see `src/utils/branded.ts`)

Example of branded type:
```typescript
export type Key = Branded<string, 'Key'>
```

#### Type Inference
- Leverage TypeScript's inference where clear
- Provide explicit return types for public functions
- Use type guards for runtime validation (see `src/utils/guard.ts`)

Example type guard:
```typescript
export function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.startsWith('n')
}
```

### Naming Conventions

#### Files
- **kebab-case**: `editor-store.ts`, `collect-schemas.ts`
- **Type files**: Match module name with `.ts` extension

#### Variables & Functions
- **camelCase**: `rootNode`, `createEditor`, `updateCount`
- **Descriptive names**: Prefer clarity over brevity
- **Boolean prefixes**: `is`, `has`, `should` for booleans

#### Types & Interfaces
- **PascalCase**: `Schema`, `FlatNode`, `EditorStore`
- **Suffix interfaces/types by purpose**: `*Schema`, `*Store`, `*Transaction`
- **Generic type parameters**: Single uppercase letter or descriptive PascalCase (`S`, `Schema`)

#### Constants
- **camelCase**: `rootKey`, `initialContent`
- **All caps for true constants**: Not commonly used in this codebase

### Functions

#### Pure Functions Preferred
- Prefer pure functions without side effects
- Use classes sparingly (mainly for stores)
- Factory functions for schema creation: `createObject`, `createArray`, etc.

#### Function Style
- **Arrow functions**: For callbacks and short functions
- **Regular functions**: For top-level exports and methods
- **Async/await**: Use over promise chains

Example:
```typescript
export function createArray<S extends Schema>(
  args: FactoryArguments<ArraySchema<S>>,
): ArraySchema<S> {
  return {
    kind: 'array',
    isFlatValue(value): value is LoroList<Key> {
      return isLoroList(value) && value.toArray().every(isKey)
    },
    ...args,
  }
}
```

### Error Handling

#### Use invariant for assertions
```typescript
import { invariant } from 'es-toolkit'

invariant(node != null, `Node with key ${key} does not exist`)
```

#### Type Guards for Validation
Use guard functions from `src/utils/guard.ts` for runtime type checking.

### React/JSX

#### Component Style
- **Function components only**: No class components
- **Hooks**: Use React hooks (useState, useEffect, useRef, etc.)
- **File extension**: `.tsx` for components

#### Props
- Define inline types or use type aliases
- Destructure props in function signature

Example:
```typescript
export default function App() {
  const rootKey = 'root' as Key
  const { store } = useEditorStore(loroDoc)
  
  return <main className="p-10">...</main>
}
```

### Comments
- Use JSDoc for public APIs when helpful
- Inline comments for complex logic only
- Prefer self-documenting code over comments

## Common Patterns

### Schema Creation
```typescript
export const MySchema = createObject({
  name: 'MySchema',
  properties: {
    field: someSchema,
  },
  keyOrder: ['field'],
})
```

### Store Updates
```typescript
store.update((tx) => {
  const key = tx.insert(schema, parentKey, (key) => value)
  return key
})
```

### Type Guards
```typescript
export const isMyType = (value: unknown): value is MyType => {
  return typeof value === 'object' && value !== null && 'field' in value
}
```

## Best Practices

1. **Type Safety First**: Use TypeScript's type system fully
2. **Immutability**: Prefer immutable patterns
3. **Single Responsibility**: Keep functions and modules focused
4. **Explicit is Better**: Don't rely on implicit behavior
5. **Test Your Changes**: Run all CI checks locally before committing
6. **Schema-Driven**: Define schemas before implementing features
7. **Flat Storage**: Remember the CRDT flat node architecture when designing

## Getting Help

- Check existing code in `src/` for patterns
- Review schema definitions in `src/schema/index.ts`
- Examine store operations in `src/store/editor-store.ts`
- CI configuration: `.github/workflows/checks.yml`
