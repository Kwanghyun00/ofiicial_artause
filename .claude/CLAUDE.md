# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artause is a performance marketing platform built with Next.js 15 (App Router) and Supabase. It connects performance venues/producers with audiences through promotional campaigns and ticket lottery events. The platform supports three roles: **audience members** (B2C), **performance partners** (B2B), and **administrators**.

## Development Commands

### Core Commands
```bash
npm install              # Install dependencies
npm run dev             # Start development server with Turbopack (http://localhost:3000)
npm run build           # Production build with Turbopack
npm start               # Start production server
npm run lint            # Run ESLint checks
npm test                # Run Vitest tests
```

### Running Individual Tests
```bash
npx vitest run <test-file-path>    # Run specific test file
npx vitest                          # Run tests in watch mode
```

## Architecture & Key Patterns

### Environment-Based Fallback System

The application has a **graceful degradation pattern** where all Supabase queries automatically fall back to mock data when environment variables are not configured. This is controlled by:

- **Detection**: `src/lib/config.ts` exports `isSupabaseConfigured` based on presence of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Query Layer**: All queries in `src/lib/supabase/queries.ts` check `isSupabaseConfigured` and return mock data from `src/lib/mocks/` when Supabase is unavailable
- **Server Actions**: Form submissions (`submitPromotionRequest`, `submitPerformanceSubmission`, `submitTicketEntry`) log to console in mock mode instead of writing to database

This pattern allows local development and UI preview without requiring Supabase setup.

### Supabase Client Architecture

**Two separate client patterns** are used depending on the execution context:

1. **Server Components & Server Actions**: Use `createServerSupabaseClient()` from `src/lib/supabase/server.ts`
   - Properly handles Next.js 15 cookies API (`await cookies()`)
   - Used in all RSC components and server action files (e.g., `src/app/*/actions.ts`)

2. **Client Components**: Use `createBrowserSupabaseClient()` from `src/lib/supabase/client.ts`
   - Browser-compatible client for client-side operations

**Never** import from `src/lib/supabaseServer.ts` (legacy file).

### Database Schema

The project uses **two schema layers** that are being consolidated:

1. **Legacy Schema** (`0001_init.sql` through `0004_performance_submission.sql`):
   - `performances`: Public performance showcase data
   - `promotion_requests`: Marketing consultation requests
   - `ticket_campaigns`: Public ticket lottery events (simple form-based)
   - `organizations`: Performance companies/producers
   - `community_posts`: Blog-style content from organizations

2. **AdGate Schema** (`20251027_adgate_schema.sql`, `20251028_ticket_campaign_ops.sql`):
   - `users`: Role-based access (member/partner/admin)
   - `shows` & `event_campaigns`: Advanced lottery campaigns with AdGate verification
   - `entries`: Weighted lottery entries with referral system
   - `adgate_verifications`: Tracks ad viewing requirements before entry eligibility
   - `lottery_runs`: Auditable lottery execution with seed hashing
   - Includes comprehensive RLS (Row Level Security) policies

**Important**: When working with ticket campaigns, check whether the feature uses the legacy `ticket_campaigns` table (simple) or the new `event_campaigns` table (advanced with AdGate).

### Role-Based Access Control (RBAC)

The platform has three user roles with distinct capabilities:

- **member** (B2C): Browse events, submit lottery entries, view personal tickets/entries
- **partner** (B2B): Submit performances, manage campaigns, view analytics
- **admin**: Approve submissions, manage users, run lottery draws, configure policies

**UI Implementation**:
- `src/components/layout/RoleContext.tsx` & `RoleGate.tsx`: Client-side role checking
- `src/components/layout/AuthContext.tsx` & `AuthGate.tsx`: Authentication state
- `wireframe_v01.md`: Contains comprehensive wireframe for all three role UIs (reference for UI features)

**Database Implementation**:
- RLS policies in `20251027_adgate_schema.sql` enforce data access per role
- Server-side role checks should use `auth.uid()` and validate against `users.role`

### Server Actions Pattern

All form submissions use Next.js Server Actions:

1. **Location**: Place actions in `src/app/[route]/actions.ts` files
2. **Validation**: Use Zod schemas from `src/lib/models/` for type-safe validation
3. **Error Handling**: Return `{ success: boolean, error?: string }` objects
4. **Revalidation**: Use `revalidatePath()` to update cached data after mutations

Example pattern:
```typescript
'use server'
import { submitTicketEntry } from '@/lib/supabase/queries'
import { ticketEntrySchema } from '@/lib/models/ticket-entry'

export async function handleTicketEntry(formData: FormData) {
  const parsed = ticketEntrySchema.safeParse(/* ... */)
  if (!parsed.success) return { success: false, error: 'Invalid input' }
  await submitTicketEntry(parsed.data)
  revalidatePath('/events/tickets')
  return { success: true }
}
```

### TypeScript Type Generation

Supabase types are auto-generated in `src/lib/supabase/types.ts` as `Database` type. To regenerate:

```bash
# Requires Supabase CLI and connection to remote project
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
```

When adding new tables or columns, regenerate types and use the `Database['public']['Tables']['table_name']['Row']` pattern.

### Component Organization

- **`src/components/layout/`**: Site shell, headers, footers, auth/role contexts
- **`src/components/forms/`**: Reusable form components with validation
- **`src/components/marketing/`**: Public-facing cards, sections, CTAs
- **`src/components/event-center/`**: Partner/admin dashboards for campaign management
- **`src/components/home/`**: Homepage-specific sections

### Caching Strategy

- Use React's `cache()` wrapper for all Supabase query functions (already implemented in `queries.ts`)
- Server components automatically benefit from Next.js request-level caching
- Use `revalidatePath()` or `revalidateTag()` in Server Actions to clear cache after mutations

### Styling

- **Tailwind CSS v4** (preview version) is used
- Custom utilities in `src/styles/` for design system tokens
- Font: Noto Sans KR (configured in `src/app/layout.tsx`)
- The wireframe in `wireframe_v01.md` includes design tokens (colors, spacing, shadows) for the role-based UIs

## Environment Variables

Create `.env.local` in project root:

```env
# Required for Supabase mode (optional - falls back to mocks if missing)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
SUPABASE_SERVICE_ROLE_KEY=admin-key-for-edge-functions
SUPABASE_PERFORMANCE_BUCKET=performance-assets
```

## Deployment (Vercel)

- Set environment variables in Vercel project settings
- `next.config.ts` already configures remote image patterns for external URLs
- Consider enabling RLS policies before production deployment

## Testing

- **Framework**: Vitest with jsdom environment
- **Setup**: `vitest.setup.ts` configures globals and @testing-library
- **Running**: `npm test` for all tests, or target specific files with `npx vitest run <path>`

## Migration Strategy Notes

The project is transitioning from simple ticket campaigns to the advanced AdGate system. When implementing new lottery/campaign features:

1. Check if the feature requires AdGate verification (intro viewing + ad dwell time)
2. If yes, use the `event_campaigns`, `entries`, and `adgate_verifications` tables
3. If no (simple external form link), use legacy `ticket_campaigns` table
4. Consult `wireframe_v01.md` for UI requirements around AdGate flow (intro-first, ad gate, weighted entries, referral codes)

## Key Files Reference

- **Queries**: `src/lib/supabase/queries.ts` - All data fetching logic
- **Types**: `src/lib/supabase/types.ts` - Database types (auto-generated)
- **Models**: `src/lib/models/*.ts` - Zod schemas for validation
- **Mocks**: `src/lib/mocks/*.ts` - Fallback data when Supabase unavailable
- **Schema**: `supabase/migrations/*.sql` - Database migrations
- **Wireframe**: `wireframe_v01.md` - Detailed UI specification for all roles
