# Quick Reference Guide

## Common Development Tasks

### Adding a New Quiz Category
1. Insert into `quizCategories` table via admin panel or migration
2. Create route in `src/routes/[category-name]/+page.server.ts`
3. Add category card to dashboard

### Adding a New Challenge Type
1. Insert into `challengeTypes` table
2. Update quiz creation form in admin panel
3. Update quiz rendering logic in `src/routes/quiz/+page.svelte`

### Creating a New API Endpoint
1. Create file: `src/routes/api/[endpoint]/+server.ts`
2. Export async functions: `GET`, `POST`, `PATCH`, `DELETE`, etc.
3. Use `locals.user` for authentication
4. Return JSON with `json()` from `@sveltejs/kit`

### Database Query Patterns

#### Simple Query
```typescript
import { db } from "$lib/server";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});
```

#### Query with Relations
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    userType: true,
    progress: true,
  },
});
```

#### Insert
```typescript
const [newUser] = await db.insert(users).values({
  username: "test",
  email: "test@example.com",
  // ...
}).returning();
```

#### Update
```typescript
await db.update(users)
  .set({ totalPoints: 100 })
  .where(eq(users.id, userId));
```

#### Complex Query
```typescript
import { and, or, eq, desc } from "drizzle-orm";

const results = await db.query.quizzes.findMany({
  where: and(
    eq(quizzes.quizCategoryId, categoryId),
    eq(quizzes.difficulty, "MEDIUM")
  ),
  orderBy: [desc(quizzes.id)],
});
```

### Authentication Check
```typescript
// In +page.server.ts or +server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId) {
    throw redirect(302, "/login");
  }
  // ...
};
```

### Admin Check
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});
const isAdmin = user?.adminLevel === 0 || user?.adminLevel === 1;
```

### Session Management
```typescript
// Set session
cookies.set("session", user.id.toString(), {
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 1 week
});

// Get session
const session = cookies.get("session");

// Delete session
cookies.delete("session", { path: "/" });
```

## File Locations

### Key Files
- **Database Schema**: `src/lib/server/db/schema.ts`
- **DB Connection**: `src/lib/server/index.ts`
- **Session Hook**: `src/hooks.server.ts`
- **Types**: `src/lib/types.ts`, `src/app.d.ts`
- **Main Layout**: `src/routes/+layout.svelte`

### Route Patterns
- **Page**: `src/routes/[name]/+page.svelte` (UI)
- **Page Load**: `src/routes/[name]/+page.server.ts` (data)
- **API**: `src/routes/api/[name]/+server.ts` (endpoint)
- **Layout**: `src/routes/[name]/+layout.svelte` (nested layout)

## Database Migrations

### Generate Migration
```bash
bun run db:generate
```

### Apply Migration
```bash
bun run db:push
# or
bun run db:migrate
```

### View Database
```bash
bun run db:studio
```

## Environment Setup

### Required Variables
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=development
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

## Common Issues

### Database Connection Error
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running
- Check SSL settings for production

### Session Not Working
- Check `hooks.server.ts` is properly loading user
- Verify cookie settings (httpOnly, secure, sameSite)
- Check browser console for cookie issues

### Type Errors
- Run `bun run check` to see TypeScript errors
- Ensure `app.d.ts` matches actual implementation
- Check `locals.user` type matches usage

### Build Errors
- Clear `.svelte-kit` directory
- Run `bun run prepare`
- Check for missing dependencies

## Testing Checklist

### Before Deploying
- [ / ] Test login/register flow
- [ / ] Test quiz submission
- [ / ] Test admin panel access
- [ / ] Test playground save/load
- [ / ] Test community posts
- [ / ] Verify database migrations
- [ / ] Check environment variables
- [ / ] Test on production-like environment

## Code Style

### Svelte Components
- Use TypeScript
- Props with `export let`
- Use `$props()` for Svelte 5
- Event handlers with `on:click`, etc.

### Server Code
- Always check authentication
- Use Drizzle ORM queries
- Return proper HTTP status codes
- Handle errors gracefully

### API Responses
```typescript
// Success
return json({ success: true, data: ... });

// Error
return json({ error: "Message" }, { status: 400 });
```
