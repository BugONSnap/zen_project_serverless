import { json } from "@sveltejs/kit";
import { users, userTypes } from "$lib/server/db/schema";
import bcrypt from "bcryptjs";
import { db } from "$lib/server";
import { eq } from "drizzle-orm";

export async function POST({ request }) {
  try {
    const { username, email, password, uniqueInfo, userType } = await request.json();

    // Validate input
    if (!username || !email || !password || !uniqueInfo || !userType) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate userType and get userTypeId
    const validUserTypes = ["STUDENT", "PROFESSIONAL", "HOBBYIST"];
    const userTypeUpper = userType.toUpperCase();
    if (!validUserTypes.includes(userTypeUpper)) {
      return json(
        { error: "Invalid user type. Must be STUDENT, PROFESSIONAL, or HOBBYIST" },
        { status: 400 }
      );
    }

    // Find the userTypeId from the userTypes table
    const userTypeRecord = await db.query.userTypes.findFirst({
      where: eq(userTypes.name, userTypeUpper),
    });

    if (!userTypeRecord) {
      return json(
        { error: "User type not found in database" },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { or, eq }) =>
        or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      return json(
        { error: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        uniqueInfo,
        userTypeId: userTypeRecord.id,
        totalPoints: 0,
        rankId: 1, // Set to Beginner rank
      })
      .returning();

    return json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
