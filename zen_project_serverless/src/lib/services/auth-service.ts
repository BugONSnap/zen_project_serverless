import { json, type Cookies } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
import { supabase } from "$lib/supabaseClient";
import type { User } from "$lib/types";

export const registerUser = async ({
  username,
  email,
  password,
  uniqueInfo,
}: User) => {
  try {
    // Validate input
    if (!username || !email || !password || !uniqueInfo) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: supabaseError } = await supabase
      .from("users")
      .select("email, username")
      .or(`email.eq.${email},username.eq.${username}`);

    if (supabaseError) {
      console.error("Supabase query error:", supabaseError);
      return json({ error: "Internal server error" }, { status: 500 });
    }

    if (existingUser && existingUser.length > 0) {
      return json(
        { error: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        username: username,
        email: email,
        password_hash: passwordHash,
        unique_info: uniqueInfo,
        total_points: 0,
        rank_id: 1,
      })
      .select("id, username, email")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return json({ error: "Internal server error" }, { status: 500 });
    }

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
};

export const loginUser = async (
  {
    encryptedEmail,
    encryptedPassword,
  }: { encryptedEmail: string; encryptedPassword: string },
  cookies: Cookies
) => {
  try {
    // Define the same secret key as on the client
    const secretKey = "your-secret-key"; // WARNING: Insecure for production!
    const decryptedEmailBytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey);
    const email = decryptedEmailBytes.toString(CryptoJS.enc.Utf8);

    // Find user by email in Supabase
    const { data: user, error: supabaseError } = await supabase
      .from("users")
      .select("id, username, email, password_hash")
      .eq("email", email)
      .single();

    console.log(user);
    if (supabaseError || !user) {
      console.error("Supabase query error or user not found:", supabaseError);
      return json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Decrypt the email and password

    const decryptedPasswordBytes = CryptoJS.AES.decrypt(
      encryptedPassword,
      secretKey
    );
    const password = decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);

    console.log("encryptedEmail:", encryptedEmail);
    console.log("encryptedPassword:", encryptedPassword);

    // Validate input
    if (!email || !password) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Set session cookie
    cookies.set("session", user.id.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
