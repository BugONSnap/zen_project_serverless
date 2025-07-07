import { users } from '$lib/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;

export interface Locals {
    user?: Pick<User, 'id' | 'username' | 'email'>;
} 