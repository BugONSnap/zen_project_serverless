import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { users } from "./src/lib/server/db/schema"; // Adjust path to your schema file

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.kgavgcaahhvfxznrjwbc:Xyrelldave23@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
});

const db = drizzle(pool);

// Seed function
async function seed() {
  try {
    // Hash passwords (using bcrypt with 10 salt rounds)
    const superAdminPassword = await bcrypt.hash("superAdmin123!", 10);
    const adminPassword = await bcrypt.hash("admin456!", 10);

    // Insert super admin and admin
    await db.insert(users).values([
      {
        username: "Superadmin",
        email: "superadmin@gmail.com",
        passwordHash: superAdminPassword,
        uniqueInfo: "Super Admin Account",
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
        createdAt: new Date(),
        totalPoints: 0,
        rankId: null, // Set to 1 if a rank exists in userRankings
        adminLevel: 1, // Admin
      },
    ]);

    console.log("Successfully seeded super admin and admin users!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed();