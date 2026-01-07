# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users can describe components they want to create, and the application generates React code with real-time preview using a virtual file system (no files written to disk).

## Development Commands

```bash
# Initial setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Run tests (uses Vitest with jsdom)
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- path/to/file.test.tsx

# Build for production
npm run build

# Linting
npm run lint

# Reset database (useful for development)
npm run db:reset
```

## Architecture

### Virtual File System

The core of UIGen is a **VirtualFileSystem** class (`src/lib/file-system.ts`) that implements an in-memory file system. This enables:
- Real-time file operations without disk I/O
- Instant preview updates
- Rollback capabilities for AI-generated code

The VFS is exposed through a React Context (`FileSystemProvider` in `src/lib/contexts/file-system-context.tsx`) and handles:
- File/directory CRUD operations
- Path normalization
- Serialization/deserialization for persistence
- Tool integration for AI file manipulation

### AI Integration Flow

1. **Chat API Route** (`src/app/api/chat/route.ts`): Handles streaming responses from Claude API
2. **AI Tools**: Two custom tools enable AI to manipulate files:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`): File editing operations (create, view, replace, insert)
   - `file_manager` (`src/lib/tools/file-manager.ts`): File management (rename, delete)
3. **Tool Execution**: Tools execute on the VFS instance, changes are streamed to client via `onToolCall` callback
4. **Context Sync**: `ChatContext` (`src/lib/contexts/chat-context.tsx`) coordinates between AI responses and file system state

### Preview System

The preview system (`src/components/preview/PreviewFrame.tsx` and `src/lib/transform/jsx-transformer.ts`) works by:
1. Transforming JSX/TSX files to plain JS using Babel standalone in the browser
2. Creating blob URLs for transformed code
3. Generating an import map that:
   - Maps local files to blob URLs
   - Resolves `@/` alias to root directory
   - Points third-party packages to esm.sh CDN
4. Injecting HTML with import map into an iframe for isolated execution
5. Collecting and injecting CSS from `.css` files

**Entry point**: Every project must have `/App.jsx` as the root component.

### Authentication & Data Persistence

- **Auth**: JWT-based sessions using `jose` library (`src/lib/auth.ts`)
- **Anonymous Mode**: Users can work without authentication; state tracked in localStorage via `src/lib/anon-work-tracker.ts`
- **Database**: SQLite with Prisma ORM
  - Users can save projects only when authenticated
  - Projects store: messages (chat history) and data (serialized VFS)
  - Prisma client generated to `src/generated/prisma/`

### Path Aliasing

The codebase uses `@/` import alias that maps to `src/`:
- TypeScript: Configured in `tsconfig.json` with `paths: { "@/*": ["./src/*"] }`
- At runtime (preview): Handled by import map in `jsx-transformer.ts`

## Important Implementation Details

### File Operations

When the AI creates/modifies files:
- Use `str_replace_editor` tool with appropriate command
- All file paths start with `/` (root of virtual filesystem)
- Use `@/` prefix for imports between local files
- The VFS automatically creates parent directories as needed

### AI Provider Setup

- Configured in `src/lib/provider.ts`
- Falls back to mock responses if `ANTHROPIC_API_KEY` is not set
- Mock provider uses limited steps (4) to prevent repetition
- System prompt in `src/lib/prompts/generation.tsx` guides AI behavior

### Testing

- Uses Vitest with React Testing Library
- Tests are colocated: `__tests__` directories next to components
- Test files use `.test.tsx` or `.test.ts` extension
- jsdom environment configured for React component testing

### Database Workflow

Prisma generates client to custom location:
```
prisma/schema.prisma → src/generated/prisma/
```

After schema changes:
```bash
npx prisma generate
npx prisma migrate dev
```
