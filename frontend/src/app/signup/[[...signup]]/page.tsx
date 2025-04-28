"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  // 1️⃣ Hold the chosen role in state
  const [role, setRole] = useState<"student" | "educator" | null>(null);

  // 2️⃣ First show buttons to pick student vs educator
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="mb-6 text-3xl font-semibold">Sign up as:</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setRole("student")}
            className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Student
          </button>
          <button
            onClick={() => setRole("educator")}
            className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Educator
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ Once role is chosen, mount Clerk's <SignUp> with unsafeMetadata
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        unsafeMetadata={{ role }}        // ← sets user.unsafeMetadata.role to "student" or "educator"
      />
    </div>
  );
}
