"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { borrowService } from "@/services/borrow.service";
import { bookService } from "@/services/book.service";
import { toast } from "sonner";
import {
  User,
  Mail,
  ShieldCheck,
  BookOpen,
  Library,
  Plus,
  LogOut,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeBorrowsCount, setActiveBorrowsCount] = useState(0);
  const [catalogedBooksCount, setCatalogedBooksCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      if (!session?.user?.id) return;

      try {
        const [borrowsRes, booksRes] = await Promise.all([
          borrowService.getBorrows("borrowed"),
          bookService.getBooks({ createdBy: session.user.id }),
        ]);

        if (borrowsRes.error) {
          toast.error(borrowsRes.error);
        }
        if (booksRes.error) {
          toast.error(booksRes.error);
        }

        if (borrowsRes.data) {
          setActiveBorrowsCount(borrowsRes.data.length);
        }
        if (booksRes.data?.books) {
          setCatalogedBooksCount(booksRes.data.books.length);
        }
      } catch (err: any) {
        console.error("Failed to load profile stats:", err);
        toast.error(err?.message || "Failed to load your profile statistics.");
      }
    }

    if (session) {
      loadStats();
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out");
      router.push("/login");
      router.refresh();
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

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="h-24 w-24 rounded-full object-cover border-4 border-amber-100 shadow-md dark:border-amber-950"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-600 text-2xl font-extrabold text-white shadow-md shadow-amber-600/30">
              {getInitials(user.name)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isAdmin ? "Library Administrator" : "Library Member"}</span>
              </span>
            </div>

            <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </p>

            <p className="flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Active BookNook Reader</span>
            </p>
          </div>

          <div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/my-borrows"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-amber-600/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Library className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              {activeBorrowsCount}
            </span>
          </div>
          <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600">
            Active Borrowed Books
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            View your current loans, check due dates, and return books.
          </p>
        </Link>

        <Link
          href="/my-books"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-amber-600/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              {catalogedBooksCount}
            </span>
          </div>
          <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600">
            Books Added to Catalog
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Manage your cataloged book titles, edit copies, or remove listings.
          </p>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Reader Actions & Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/books"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <BookOpen className="h-4 w-4 text-amber-600" />
            <span>Explore All Books</span>
          </Link>

          <Link
            href="/add-book"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4 text-amber-600" />
            <span>Add New Book</span>
          </Link>

          <Link
            href="/my-borrows"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Library className="h-4 w-4 text-amber-600" />
            <span>My Borrow History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

