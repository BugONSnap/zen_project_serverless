import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  boolean,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define enum for difficulty levels
export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  uniqueInfo: text("unique_info").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  totalPoints: integer("total_points").default(0),
  rankId: integer("rank_id").references(() => userRankings.id),
});

// Quiz Categories table
export const quizCategories = pgTable("quiz_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// Challenge Types table
export const challengeTypes = pgTable("challenge_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  quizCategoryId: integer("quiz_category_id").references(
    () => quizCategories.id
  ),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  challengeTypeId: integer("challenge_type_id").references(
    () => challengeTypes.id
  ),
  quizCategoryId: integer("quiz_category_id").references(
    () => quizCategories.id
  ),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  difficulty: difficultyEnum("difficulty").default("MEDIUM"),
  timeLimit: integer("time_limit"),
  options: jsonb("options"),
});

// User Progress table
export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    quizCategoryId: integer("quiz_category_id").references(
      () => quizCategories.id
    ),
    totalQuizzes: integer("total_quizzes").default(0),
    completedQuizzes: integer("completed_quizzes").default(0),
    completionPercentage: real("completion_percentage").default(0),
  },
  (table) => ({
    uniqueUserCategory: unique().on(table.userId, table.quizCategoryId),
  })
);

// User Rankings table
export const userRankings = pgTable("user_rankings", {
  id: serial("id").primaryKey(),
  rankName: text("rank_name").notNull(),
  minPoints: integer("min_points").notNull(),
  maxPoints: integer("max_points"),
});

// Quiz Results table
export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  attemptDate: timestamp("attempt_date").defaultNow(),
  isCorrect: boolean("is_correct").notNull(),
  pointsEarned: integer("points_earned"),
});

// Code Snippets table for playground
export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  htmlCode: text("html_code").default(""),
  cssCode: text("css_code").default(""),
  jsCode: text("js_code").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations (unchanged from your original)
export const usersRelations = relations(users, ({ one, many }) => ({
  rank: one(userRankings, {
    fields: [users.rankId],
    references: [userRankings.id],
  }),
  progress: many(userProgress),
  quizResults: many(quizResults),
  codeSnippets: many(codeSnippets),
}));

export const quizCategoriesRelations = relations(
  quizCategories,
  ({ many }) => ({
    challengeTypes: many(challengeTypes),
    quizzes: many(quizzes),
    userProgress: many(userProgress),
  })
);

export const challengeTypesRelations = relations(
  challengeTypes,
  ({ one, many }) => ({
    quizCategory: one(quizCategories, {
      fields: [challengeTypes.quizCategoryId],
      references: [quizCategories.id],
    }),
    quizzes: many(quizzes),
  })
);

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  challengeType: one(challengeTypes, {
    fields: [quizzes.challengeTypeId],
    references: [challengeTypes.id],
  }),
  quizCategory: one(quizCategories, {
    fields: [quizzes.quizCategoryId],
    references: [quizCategories.id],
  }),
  results: many(quizResults),
}));

export const userProgressRelations = relations(
  userProgress,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userProgress.userId],
      references: [users.id],
    }),
    quizCategory: one(quizCategories, {
      fields: [userProgress.quizCategoryId],
      references: [quizCategories.id],
    }),
    quizzes: many(quizzes),
  })
);

export const userRankingsRelations = relations(userRankings, ({ many }) => ({
  users: many(users),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizResults.quizId],
    references: [quizzes.id],
  }),
}));

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  user: one(users, {
    fields: [codeSnippets.userId],
    references: [users.id],
  }),
}));
