import { db } from "$lib/server";
import { users, siteVisits } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const handle = async ({ event, resolve }) => {
  const session = event.cookies.get("session");
  let userId: number | null = null;

  if (session) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(session, 10)),
    });
    if (user) {
      userId = user.id;
      event.locals.user = {
        // Explicitly define the structure of locals.user
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }
  }

  // Log site visit (both logged in and anonymous users)
  const page = event.url.pathname;
  
  // Only log visits to main pages (exclude static assets, API calls, etc.)
  const shouldLog = !page.startsWith('/api/') && 
                    !page.includes('.') && 
                    !page.startsWith('/_') &&
                    page !== '/favicon.ico';

  if (shouldLog) {
    try {
      // Get or create session ID for anonymous users
      let sessionId = event.cookies.get('site_session');
      if (!sessionId) {
        // Generate a simple session ID (in production, use a proper UUID)
        sessionId = crypto.randomUUID();
        event.cookies.set('site_session', sessionId, {
          path: '/',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
        });
      }

      await db.insert(siteVisits).values({
        sessionId: sessionId,
        userId: userId,
        page: page,
        referrer: event.request.headers.get('referer') || null,
        userAgent: event.request.headers.get('user-agent') || null,
      });
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Site visit logging error:', error);
    }
  }

  const response = await resolve(event);
  return response;
};
