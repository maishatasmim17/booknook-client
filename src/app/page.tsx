"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { HeroSlider } from "@/components/home/HeroSlider";
import { BookCard } from "@/components/books/BookCard";
import { BorrowModal } from "@/components/modals/BorrowModal";
import { Book, bookService } from "@/services/book.service";
import {
  BookOpen,
  Search,
  ArrowRight,
  Sparkles,
  Library,
  Clock,
  ShieldCheck,
  Compass,
  BookmarkCheck,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  { name: "Fiction", icon: BookOpen, count: "120+ Titles" },
  { name: "Science", icon: Sparkles, count: "95+ Titles" },
  { name: "History", icon: Library, count: "65+ Titles" },
  { name: "Kids", icon: BookmarkCheck, count: "80+ Titles" },
  { name: "Others", icon: Compass, count: "40+ Titles" },
];

function HomeView() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [latestBooks, setLatestBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);

  const fetchLatestBooks = async () => {
    try {
      setLoading(true);
      const res = await bookService.getBooks({ limit: 6, sortBy: "createdAt", sortOrder: "desc" });
      if (res.data?.books) {
        setLatestBooks(res.data.books);
      }
    } catch (error) {
      console.error("Failed to load latest books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 py-6 pb-20">
      {/* 1. Hero Swiper Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSlider />
      </section>

      {/* 2. Quick Search & Discovery Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Search className="pointer-events-none ml-3 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, author, or genre (e.g., Jane Austen, Science, Fiction)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-neutral-100"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
          >
            Find Books
          </button>
        </form>
      </section>

      {/* 3. Latest 6 Books from MongoDB */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              <Sparkles className="h-4 w-4" />
              <span>Fresh Additions</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              Latest Books in the Library
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Recently cataloged titles ready for you to explore and borrow.
            </p>
          </div>
        </div>

        {/* Book Grid / Loading Skeletons */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm animate-pulse dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="aspect-[3/4] w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : latestBooks.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
            <Library className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              No books cataloged yet
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Be the first to add a book to the BookNook online collection!
            </p>
            <div className="mt-6">
              <Link
                href="/add-book"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
              >
                Add the First Book
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestBooks.map((book) => (
                <BookCard
                  key={book.id || (book as any)._id}
                  book={book}
                  onBorrowClick={(b) => {
                    if (!session?.user) {
                      toast.error("Please sign in to borrow books");
                      router.push(
                        `/login?callbackUrl=${encodeURIComponent(`/books/${b.id || (b as any)._id}`)}`
                      );
                      return;
                    }
                    setSelectedBookForBorrow(b);
                  }}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
              >
                <span>See All Books</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* 4. Featured Genres & Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
              Discover by Topic
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Popular Literary Genres
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Browse through our diverse stacks to find books that match your curiosity.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/books?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-200 p-4 transition duration-200 hover:-translate-y-1 hover:border-amber-600/40 hover:bg-amber-50/50 hover:shadow-md dark:border-neutral-800 dark:hover:border-amber-500/40 dark:hover:bg-amber-950/20"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950 dark:text-amber-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Library Highlights & Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Flexible Loan Periods
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Borrow books for 7, 14, or 30 days. Manage your loans effortlessly from your reader dashboard with due date reminders.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Atomic Inventory Tracking
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Real-time copy count updates prevent double-borrowing. Always know which titles are on the shelf before heading to checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Community Curation
            </h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every member can contribute to our growing library by cataloging new books, writing honest reviews, and sharing recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Borrow Modal */}
      <BorrowModal
        book={selectedBookForBorrow}
        isOpen={Boolean(selectedBookForBorrow)}
        onClose={() => setSelectedBookForBorrow(null)}
        onSuccess={fetchLatestBooks}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <HomeView />
    </Suspense>
  );
}
