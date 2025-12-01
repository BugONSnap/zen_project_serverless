import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { users, userProgress, userTypes } from "./src/lib/server/db/schema"; // Adjust path to your schema file

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.kgavgcaahhvfxznrjwbc:Xyrelldave23@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
});

const db = drizzle(pool);

// Seed function
async function seed() {
  try {
    // Seed user types first
    const insertedUserTypes = await db.insert(userTypes).values([
      { name: "STUDENT" },
      { name: "PROFESSIONAL" },
      { name: "HOBBYIST" },
    ]).returning();

    // Find the PROFESSIONAL user type ID
    const professionalType = insertedUserTypes.find(ut => ut.name === "PROFESSIONAL");
    if (!professionalType) {
      throw new Error("PROFESSIONAL user type not found after seeding");
    }
    const professionalTypeId = professionalType.id;

    // Hash passwords (using bcrypt with 10 salt rounds)
    const superAdminPassword = await bcrypt.hash("superAdmin123!", 10);
    const adminPassword = await bcrypt.hash("admin456!", 10);

    // Insert super admin and admin
    const insertedUsers = await db.insert(users).values([
      {
        username: "Superadmin",
        email: "superadmin@gmail.com",
        passwordHash: superAdminPassword,
        uniqueInfo: "Super Admin Account",
        userTypeId: professionalTypeId,
        createdAt: new Date(),
        totalPoints: 0,
        rankId: null, // Set to 1 if a rank exists in userRankings
        adminLevel: 0, // Super Admin
      },
      {
        username: "admin",
        email: "admin@gmail.com",
        passwordHash: adminPassword,
        uniqueInfo: "Admin Account",
        userTypeId: professionalTypeId,
        createdAt: new Date(),
        totalPoints: 0,
        rankId: null, // Set to 1 if a rank exists in userRankings
        adminLevel: 1, // Admin
      },
    ]).returning({ id: users.id });

    // Insert user progress bookmarks using the returned user IDs
    await db.insert(userProgress).values([
      {
        userId: insertedUsers[0].id, // Superadmin
        quizCategoryId: 1, // Change as needed
        totalQuizzes: 10, // Example value
        completedQuizzes: 4, // Example value
        completionPercentage: 40, // Example value
        lastQuizId: 2, // The quiz the user last reached
        lastQuestionIndex: 3, // The question index the user last reached
      },
      {
        userId: insertedUsers[1].id, // Admin
        quizCategoryId: 2, // Change as needed
        totalQuizzes: 8, // Example value
        completedQuizzes: 2, // Example value
        completionPercentage: 25, // Example value
        lastQuizId: 5,
        lastQuestionIndex: 1,
      },
    ]);

    // Seed community posts
    const { community } = await import("./src/lib/server/db/schema");
    await db.insert(community).values([
      {
        userId: insertedUsers[0].id,
        content: "Zentry is an amazing platform!",
        rating: 5,
        createdAt: new Date(),
      },
      {
        userId: insertedUsers[1].id,
        content: "Great for learning, but could use more quizzes.",
        rating: 4,
        createdAt: new Date(),
      },
    ]);
    console.log("Successfully seeded super admin, admin users, user progress, and community posts!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed();