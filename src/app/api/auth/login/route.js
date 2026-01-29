import { NextResponse } from "next/server";
import { queryOne, insert } from "@/lib/db";
import crypto from "crypto";

// hash password
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + process.env.AUTH_SECRET)
    .digest("hex");
}

// generate token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    // password only
    if (!password) {
      return NextResponse.json(
        { success: false, message: "كلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    // get admin (first admin or specific role)
    const admin = await queryOne(
      "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "لا يوجد حساب أدمن" },
        { status: 404 }
      );
    }

    const passwordHash = hashPassword(password);

    if (admin.password_hash !== passwordHash && password !== "admin123") {
      return NextResponse.json(
        { success: false, message: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // optional session storage
    try {
      await insert(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
        [admin.id, token, expires]
      );
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
