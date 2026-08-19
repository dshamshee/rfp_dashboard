import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const userRole = String(role || "ADMIN").toUpperCase().trim();

    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Role must be 'ADMIN' or 'SUPERADMIN'.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists with this email address.",
        },
        { status: 409 }
      );
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
      });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: createdUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during user creation.",
      },
      { status: 500 }
    );
  }
}
