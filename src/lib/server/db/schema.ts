import { sqliteTable, integer, text, primaryKey, unique, real, blob } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	uniqueInfo: text('unique_info').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	totalPoints: integer('total_points').default(0),
	rankId: integer('rank_id').references(() => userRankings.id)
});

// Quiz Categories table
export const quizCategories = sqliteTable('quiz_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull()
});

// Challenge Types table
export const challengeTypes = sqliteTable('challenge_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	quizCategoryId: integer('quiz_category_id').references(() => quizCategories.id)
});

// Quizzes table
export const quizzes = sqliteTable('quizzes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	challengeTypeId: integer('challenge_type_id').references(() => challengeTypes.id),
	quizCategoryId: integer('quiz_category_id').references(() => quizCategories.id),
	title: text('title').notNull(),
	description: text('description'),
	points: integer('points').notNull(),
	answer: text('answer').notNull(),
	explanation: text('explanation'),
	difficulty: text('difficulty', { enum: ['EASY', 'MEDIUM', 'HARD'] }).default('MEDIUM'),
	timeLimit: integer('time_limit'),
	options: blob('options', { mode: 'json' })
});

// User Progress table
export const userProgress = sqliteTable('user_progress', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id),
	quizCategoryId: integer('quiz_category_id').references(() => quizCategories.id),
	totalQuizzes: integer('total_quizzes').default(0),
	completedQuizzes: integer('completed_quizzes').default(0),
	completionPercentage: real('completion_percentage').default(0)
}, (table) => ({
	uniqueUserCategory: unique().on(table.userId, table.quizCategoryId)
}));

// User Rankings table
export const userRankings = sqliteTable('user_rankings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	rankName: text('rank_name').notNull(),
	minPoints: integer('min_points').notNull(),
	maxPoints: integer('max_points')
});

// Quiz Results table
export const quizResults = sqliteTable('quiz_results', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id),
	quizId: integer('quiz_id').references(() => quizzes.id),
	attemptDate: integer('attempt_date', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
	pointsEarned: integer('points_earned')
});

// Code Snippets table for playground
export const codeSnippets = sqliteTable('code_snippets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id),
	title: text('title').notNull(),
	htmlCode: text('html_code').default(''),
	cssCode: text('css_code').default(''),
	jsCode: text('js_code').default(''),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
	rank: one(userRankings, {
		fields: [users.rankId],
		references: [userRankings.id],
	}),
	progress: many(userProgress),
	quizResults: many(quizResults),
	codeSnippets: many(codeSnippets)
}));

export const quizCategoriesRelations = relations(quizCategories, ({ many }) => ({
	challengeTypes: many(challengeTypes),
	quizzes: many(quizzes),
	userProgress: many(userProgress)
}));

export const challengeTypesRelations = relations(challengeTypes, ({ one, many }) => ({
	quizCategory: one(quizCategories, {
		fields: [challengeTypes.quizCategoryId],
		references: [quizCategories.id],
	}),
	quizzes: many(quizzes)
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
	challengeType: one(challengeTypes, {
		fields: [quizzes.challengeTypeId],
		references: [challengeTypes.id],
	}),
	quizCategory: one(quizCategories, {
		fields: [quizzes.quizCategoryId],
		references: [quizCategories.id],
	}),
	results: many(quizResults)
}));

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
	user: one(users, {
		fields: [userProgress.userId],
		references: [users.id],
	}),
	quizCategory: one(quizCategories, {
		fields: [userProgress.quizCategoryId],
		references: [quizCategories.id],
	}),
	quizzes: many(quizzes)
}));

export const userRankingsRelations = relations(userRankings, ({ many }) => ({
	users: many(users)
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
	user: one(users, {
		fields: [quizResults.userId],
		references: [users.id],
	}),
	quiz: one(quizzes, {
		fields: [quizResults.quizId],
		references: [quizzes.id],
	})
}));

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
	user: one(users, {
		fields: [codeSnippets.userId],
		references: [users.id],
	})
}));
