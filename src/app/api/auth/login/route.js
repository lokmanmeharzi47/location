import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Force Node.js runtime for crypto/bcrypt compatibility
export const runtime = "nodejs";

/**
 * Generate a secure 64-character hex token
 */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request) {
  const client = await pool.connect();

  try {
    // 1. Parse and Validate Input
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Strict type checking
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Fetch User (Admin Only)
    // We explicitly select only needed fields
    const userQuery = `
      SELECT id, email, password_hash, name, role
      FROM users
      WHERE email = $1
      LIMIT 1
    `;

    const { rows } = await client.query(userQuery, [cleanEmail]);
    const user = rows[0];

    // 3. Security Check: Admin Role & User Existence
    // We check role here carefully to ensure case-sensitivity isn't an issue if role is a string
    // If it's an enum, it's safer, but strict comparison is good.
    const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN');

    if (!user || !isAdmin || !user.password_hash) {
      // Return generic error to prevent enumeration
      // (Optional: add a slight delay here to mitigate timing attacks if desired)
      return NextResponse.json(
        { success: false, message: "بيانات الدخول غير صحيحة" }, // Invalid credentials
        { status: 401 }
      );
    }

    // 4. Verify Password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
            console.log("Invalid password attempt for user:", cleanEmail);

      return NextResponse.json(
        { success: false, message: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // 5. Create Secure Session
    const token = generateToken();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + oneDayInMs);

    const sessionQuery = `
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;

    await client.query(sessionQuery, [user.id, token, expiresAt]);

    // 6. Set Secure Cookie & Response
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 'strict' can sometimes block redirect flows, 'lax' is safer for general navigation
      expires: expiresAt,
      path: "/",
      priority: "high",
    });

    return response;

  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
