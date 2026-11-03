"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { toast } from "sonner";
import {
  BookOpen,
  User,
  LogOut,
  Library,
  ChevronDown,
  Menu,
  X,
  Plus,
  BookMarked,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out");
      setDropdownOpen(false);
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out");
    }
  };

  const user = session?.user;
  const isAdmin = (user as any)?.role === "admin";

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Book<span className="text-amber-600">Nook</span>
            </span>
            <span className="block text-[10px] -mt-1 font-medium text-neutral-500 uppercase tracking-widest">
              Online Library
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition hover:text-amber-600 ${
              isActive("/") ? "text-amber-600 font-bold" : "text-neutral-600 dark:text-neutral-300"
            }`}
          >
            Home
          </Link>
          <Link
            href="/books"
            className={`transition hover:text-amber-600 ${
              isActive("/books") ? "text-amber-600 font-bold" : "text-neutral-600 dark:text-neutral-300"
            }`}
          >
            All Books
          </Link>
          {session && (
            <>
              <Link
                href="/my-borrows"
                className={`transition hover:text-amber-600 ${
                  isActive("/my-borrows") ? "text-amber-600 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                My Borrows
              </Link>
              <Link
                href="/my-books"
                className={`transition hover:text-amber-600 ${
                  isActive("/my-books") ? "text-amber-600 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                My Books
              </Link>
              <Link
                href="/add-book"
                className={`flex items-center gap-1.5 transition hover:text-amber-600 ${
                  isActive("/add-book") ? "text-amber-600 font-bold" : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <Plus className="h-4 w-4 text-amber-600" />
                Add Book
              </Link>
            </>
          )}
        </nav>

        {/* Auth CTA / User Profile Dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          ) : session && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-neutral-100 focus:outline-none dark:hover:bg-neutral-900"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {user.name || "Reader"}
                  </div>
                  <div className="text-[10px] text-neutral-500 capitalize">
                    {(user as any).role || "Member"}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 dark:border-neutral-800 dark:bg-neutral-900 z-50">
                  <div className="border-b border-neutral-100 px-3 py-2.5 dark:border-neutral-800">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                      {isAdmin ? "Administrator" : "Library Member"}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <User className="h-4 w-4 text-neutral-500" />
                      My Profile & Stats
                    </Link>

                    <Link
                      href="/my-borrows"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <Library className="h-4 w-4 text-neutral-500" />
                      My Borrowed Books
                    </Link>

                    <Link
                      href="/my-books"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <BookMarked className="h-4 w-4 text-neutral-500" />
                      My Added Books
                    </Link>

                    <Link
                      href="/add-book"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                    >
                      <Plus className="h-4 w-4" />
                      Add a Book
                    </Link>
                  </div>

                  <div className="border-t border-neutral-100 pt-1 dark:border-neutral-800">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-200 bg-white px-4 py-4 md:hidden dark:border-neutral-800 dark:bg-neutral-950">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-neutral-700 hover:text-amber-600 dark:text-neutral-300"
            >
              Home
            </Link>
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-neutral-700 hover:text-amber-600 dark:text-neutral-300"
            >
              All Books
            </Link>
            {session && (
              <>
                <Link
                  href="/my-borrows"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-neutral-700 hover:text-amber-600 dark:text-neutral-300"
                >
                  My Borrowed Books
                </Link>
                <Link
                  href="/my-books"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-neutral-700 hover:text-amber-600 dark:text-neutral-300"
                >
                  My Added Books
                </Link>
                <Link
                  href="/add-book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-amber-600 font-semibold"
                >
                  + Add Book
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-neutral-700 hover:text-amber-600 dark:text-neutral-300"
                >
                  My Profile
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
