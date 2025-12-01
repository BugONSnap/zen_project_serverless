import { relations, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// user ranking table
export const userRankings = pgTable("user_rankings", {
  id: serial("id").primaryKey(),
  rankName: text("rank_name").notNull(),
  minPoints: integer("min_points").notNull(),
  maxPoints: integer("max_points"),
});

// user types table
export const userTypes = pgTable("user_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // STUDENT | PROFESSIONAL | HOBBYIST
});

// quiz categories table
export const quizCategories = pgTable("quiz_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  uniqueInfo: text("unique_info").notNull(),
  userTypeId: integer("user_type_id").references(() => userTypes.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  totalPoints: integer("total_points").default(0),
  rankId: integer("rank_id").references(() => userRankings.id),
  adminLevel: integer("admin_level").notNull().default(2), // 0 for super admin, 1 for admin, 2 for user
});

// challenge types table
export const challengeTypes = pgTable("challenge_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  quizCategoryId: integer("quiz_category_id").references(
    () => quizCategories.id
  ),
});

// quizzes table
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
  difficulty: text("difficulty").default("MEDIUM"),
  timeLimit: integer("time_limit"),
  options: jsonb("options"),
});

// user progress table
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
    // Bookmark fields for quiz resume
    lastQuizId: integer("last_quiz_id"),
    lastQuestionIndex: integer("last_question_index"),
  },
  (table) => ({
    uniqueUserCategory: unique().on(table.userId, table.quizCategoryId),
  })
);

// quiz results table
export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  attemptDate: timestamp("attempt_date").defaultNow(),
  isCorrect: boolean("is_correct").notNull(),
  pointsEarned: integer("points_earned"),
});

// quiz attempts (for resume/bookmark)
export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    quizId: integer("quiz_id").references(() => quizzes.id),
    status: text("status").notNull().default("IN_PROGRESS"), // IN_PROGRESS | COMPLETED | ABANDONED
    answers: jsonb("answers"), // partial answers/state
    currentStep: integer("current_step").default(0),
    timeRemaining: integer("time_remaining"),
    startedAt: timestamp("started_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // enforce uniqueness by (user, quiz, status). This ensures at most one IN_PROGRESS per quiz per user.
    uniqueAttemptPerStatus: unique().on(table.userId, table.quizId, table.status),
  })
);

// code snippets table
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

// community posts table
export const community = pgTable("community", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

// community likes/dislikes table
export const communityLikes = pgTable("community_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => community.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isLike: boolean("is_like").notNull(), // true = like, false = dislike
  createdAt: timestamp("created_at").defaultNow(),
});

// community replies table
export const communityReplies = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => community.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userTypesRelations = relations(userTypes, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  userType: one(userTypes, {
    fields: [users.userTypeId],
    references: [userTypes.id],
  }),
  rank: one(userRankings, {
    fields: [users.rankId],
    references: [userRankings.id],
  }),
  progress: many(userProgress),
  quizResults: many(quizResults),
  quizAttempts: many(quizAttempts),
  codeSnippets: many(codeSnippets),
  communityPosts: many(community),
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
  attempts: many(quizAttempts),
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

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  user: one(users, {
    fields: [codeSnippets.userId],
    references: [users.id],
  }),
}));

export const communityRelations = relations(community, ({ one, many }) => ({
  user: one(users, {
    fields: [community.userId],
    references: [users.id],
  }),
  likes: many(communityLikes),
  replies: many(communityReplies),
}));

export const communityLikesRelations = relations(communityLikes, ({ one }) => ({
  post: one(community, { fields: [communityLikes.postId], references: [community.id] }),
  user: one(users, { fields: [communityLikes.userId], references: [users.id] }),
}));

export const communityRepliesRelations = relations(communityReplies, ({ one }) => ({
  post: one(community, { fields: [communityReplies.postId], references: [community.id] }),
  user: one(users, { fields: [communityReplies.userId], references: [users.id] }),
}));

export type User = InferSelectModel<typeof users>;