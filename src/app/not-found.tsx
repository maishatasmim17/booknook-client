import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Compass, ArrowLeft, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 shadow-xl shadow-amber-600/10 dark:bg-amber-950 dark:text-amber-400">
        <Compass className="h-12 w-12 animate-pulse" />
      </div>

      <span className="mt-8 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
        404 – Page Not Found
      </span>

      <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
        Lost in the Stacks?
      </h1>

      <p className="mt-3 max-w-md text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        The book, shelf, or page you are looking for appears to have been checked out, archived, or misfiled in another section of the library.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
        >
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <Search className="h-4 w-4 text-neutral-400" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    </div>
  );
}

