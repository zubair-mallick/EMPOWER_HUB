"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Transition } from "@headlessui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Brain,
  Bot,
  CalendarCheck2,
  BookOpenCheck,
  LogIn,
  UserPlus,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const { user } = useUser();
  const role = user?.unsafeMetadata?.role;

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolling ? "bg-black shadow-lg" : "bg-transparent"
      } text-white border-b border-gray-800`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold hover:underline">
              IMPOWERHUB
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/education"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <GraduationCap size={18} /> Education
            </Link>
            <Link
              href="/counseling"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <Brain size={18} /> Counseling
            </Link>
            <Link
              href="/chatbot"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <Bot size={18} /> AI Chatbot
            </Link>

            <SignedOut>
              <div className="flex items-center gap-4 ml-4">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    <LogIn size={16} /> Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    <UserPlus size={16} /> Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-4 ml-4">
                {role === "councellor" && (
                  <Link
                    href="/mybooking"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
                  >
                    <BookOpenCheck size={18} /> My Bookings
                  </Link>
                )}
                {role === "student" && (
                  <Link
                    href="/book"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
                  >
                    <CalendarCheck2 size={18} /> Book Appointment
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex -mr-2 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        {(ref) => (
          <div className="md:hidden" id="mobile-menu">
            {/* @ts-expect-error */}
            <div ref={ref} className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
              <Link
                href="/education"
                className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md hover:bg-gray-700"
              >
                <GraduationCap size={18} /> Education
              </Link>
              <Link
                href="/counseling"
                className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md hover:bg-gray-700"
              >
                <Brain size={18} /> Counseling
              </Link>
              <Link
                href="/chatbot"
                className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md hover:bg-gray-700"
              >
                <Bot size={18} /> AI Chatbot
              </Link>

              <SignedOut>
                <div className="flex flex-col gap-2 mt-4">
                  <SignInButton mode="modal">
                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      <LogIn size={16} /> Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                      <UserPlus size={16} /> Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="mt-4 flex flex-col gap-2">
                  {role === "councellor" && (
                    <Link
                      href="/mybooking"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    >
                      <BookOpenCheck size={18} /> My Bookings
                    </Link>
                  )}
                  {role === "student" && (
                    <Link
                      href="/book"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    >
                      <CalendarCheck2 size={18} /> Book Appointment
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </Transition>
    </nav>
  );
};

export default Navbar;
