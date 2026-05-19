import { NextResponse } from "next/server";
import { query } from "@/lib/db";
// Maan lete hain aapke paas password hash karne ke liye hashPassword function hai
import { hashPassword } from "@/lib/auth"; 

export async function POST(request) {
  try {
   const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Check karein ki user pehle se toh nahi hai
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Password ko hash karein (Login ke comparePassword se match karne ke liye)
    const hashedPassword = await hashPassword(password);

    // 3. Database mein insert karein (is_active ko 1 rakhna mat bhoolna)
    await query(
  "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)",
  [name, email, hashedPassword, role || 'admin'] // Agar role na mile toh default admin ya jo bhi allowed ho
);

    return NextResponse.json({ success: true, message: "User registered successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}