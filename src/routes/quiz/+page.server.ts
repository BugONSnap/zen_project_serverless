import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { quizzes, quizCategories, challengeTypes } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { error as svelteError } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url }) => {
  const id = url.searchParams.get("id");
  let quiz;

  if (id) {
    quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, Number(id)),
    });
    if (!quiz) throw svelteError(404, "Quiz not found");
  } else {
    const categoryName = url.searchParams.get("category");
    let difficulty = url.searchParams.get("difficulty");
    if (!categoryName || !difficulty) throw svelteError(404, "Quiz not found");
    difficulty = difficulty.toUpperCase();
    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty))
      throw svelteError(404, "Invalid difficulty");
    const category = await db.query.quizCategories.findFirst({
      where: eq(quizCategories.name, categoryName),
    });
    if (!category) throw svelteError(404, "Quiz category not found");
    quiz = await db.query.quizzes.findFirst({
      where: and(
        eq(quizzes.quizCategoryId, category.id),
        eq(quizzes.difficulty, difficulty as "EASY" | "MEDIUM" | "HARD")
      ),
    });
    if (!quiz) throw svelteError(404, "Quiz not found");
  }

  // Fetch the challenge type name
  let challengeTypeName = null;
  if (quiz.challengeTypeId) {
    const challengeType = await db.query.challengeTypes.findFirst({
      where: eq(challengeTypes.id, quiz.challengeTypeId),
    });
    if (challengeType) {
      challengeTypeName = challengeType.name;
    }
  }

  // let questions = [];
  // if (quiz?.options) {
  //   try {
  //     questions =
  //       typeof quiz.options === "string" ? JSON.parse(quiz.options) : [];
  //   } catch {
  //     questions = [];
  //   }
  // }

  // // If Complete the Code, Code Challenge or Identification and questions is empty, create a default question
  // if (
  //   (challengeTypeName === "Complete the Code" ||
  //     challengeTypeName === "Code Challenge" ||
  //     challengeTypeName === "Identification") &&
  //   (!questions || questions.length === 0)
  // ) {
  //   questions = [
  //     {
  //       id: 1,
  //       question: quiz.description,
  //       starterCode:
  //         challengeTypeName === "Code Challenge" ? quiz.answer : undefined, // Only include starterCode for Code Challenge
  //       correctAnswer: quiz.answer,
  //     },
  //   ];
  // }

  let questions = [];
  if (quiz?.options) {
    try {
      questions =
        typeof quiz.options === "string"
          ? JSON.parse(quiz.options)
          : quiz.options;
    } catch {
      questions = [];
    }
  }

  // If questions is empty, create a default question for any challenge type
  if (!questions || questions.length === 0) {
    if (
      challengeTypeName === "Complete the Code" ||
      challengeTypeName === "Code Challenge" ||
      challengeTypeName === "Identification"
    ) {
      questions = [
        {
          id: 1,
          question: quiz.description,
          starterCode:
            challengeTypeName === "Code Challenge" ? quiz.answer : undefined,
          correctAnswer: quiz.answer,
        },
      ];
    } else if (challengeTypeName === "Multiple Choice") {
      // For Multiple Choice, create a question from the quiz data
      questions = [
        {
          id: 1,
          question: quiz.description,
          options: [quiz.answer], // You might want to add more options here
          correctAnswer: 0,
        },
      ];
    }
  }

  // Fetch all quizzes in the same category and difficulty, ordered by id
  let allQuizzes: (typeof quizzes.$inferSelect)[] = [];
  if (quiz && quiz.quizCategoryId != null && quiz.difficulty != null) {
    allQuizzes = await db.query.quizzes.findMany({
      where: and(
        eq(quizzes.quizCategoryId, quiz.quizCategoryId),
        eq(quizzes.difficulty, quiz.difficulty)
      ),
      orderBy: [quizzes.id],
    });
  }

  console.log("Final quiz data:", {
    id: quiz.id,
    title: quiz.title,
    challengeType: quiz.challengeTypeId,
    options: quiz.options,
  });

  return {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      explanation: quiz.explanation,
      difficulty: quiz.difficulty,
      questions,
      answer: quiz.answer,
      challengeType: challengeTypeName,
    },
    category: quiz.quizCategoryId,
    difficulty: quiz.difficulty,
    allQuizzes,
  };
};
