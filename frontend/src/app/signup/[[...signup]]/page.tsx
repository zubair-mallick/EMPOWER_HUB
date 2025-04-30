'use client';

import { useState, useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  const [role, setRole] = useState<'student' | 'councellor' | null>(null);
  const [speciality, setSpeciality] = useState('');
  const [field, setField] = useState('');
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false); // 👈 Track if we should show Clerk SignUp

  useEffect(() => {
    if (speciality && field) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  }, [speciality, field]);

  // 1️⃣ Show role selection
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="mb-6 text-3xl font-semibold text-black">Sign up as:</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setRole('student');
              setShowSignUpForm(true); // Students go directly to sign-up
            }}
            className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Student
          </button>
          <button
            onClick={() => setRole('councellor')}
            className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Counselor
          </button>
        </div>
      </div>
    );
  }

  // 2️⃣ Counselor form for specialty and field
  if (role === 'councellor' && !showSignUpForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="mb-6 text-3xl font-semibold text-black">Sign up as Counselor</h1>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Speciality (e.g., Psychology)"
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            className="px-4 py-2 border rounded-md w-80 text-black"
          />
          <input
            type="text"
            placeholder="Field (e.g., Mental Health)"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="px-4 py-2 border rounded-md w-80 text-black"
          />
          <button
            onClick={() => setShowSignUpForm(true)} // 👈 Show Clerk form on click
            className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700"
            disabled={!isFormFilled}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ Final: Clerk SignUp with metadata
  return (
    
    <div className="flex justify-center items-center mt-16 mb-10 px-4 sm:px-6 md:px-8">
    <div className="w-full max-w-md">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        unsafeMetadata={{
          role,
          speciality: role === 'councellor' ? speciality : undefined,
          field: role === 'councellor' ? field : undefined,
        }}
      />
    </div>
  </div>
  
  
  );
}
