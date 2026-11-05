"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Book, bookService } from "@/services/book.service";
import { BookCard } from "@/components/books/BookCard";
import { BorrowModal } from "@/components/modals/BorrowModal";
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const CATEGORIES = ["All", "Fiction", "Science", "History", "Kids", "Others"];

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookService.getBooks({
        search: search.trim() || undefined,
        category: category !== "All" ? category : undefined,
        available: availableOnly ? true : undefined,
        page,
        limit: 12,
        sortBy,
        sortOrder,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.data) {
        setBooks(res.data.books);
        setTotalPages(res.data.pagination.totalPages);
        setTotalBooks(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch books:", err);
      toast.error("Failed to load the book catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category, availableOnly, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setAvailableOnly(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-amber-600" />
          Library Catalog
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl">
          Browse our entire catalog of curated titles. Use the search bar and filters to discover your next read or find books available to borrow right now.
        </p>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 pl-10 pr-24 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Search
            </button>
          </form>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-") as [string, "asc" | "desc"];
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-700 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <option value="createdAt-desc">Newest Additions</option>
              <option value="createdAt-asc">Oldest Additions</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="totalCopies-desc">Most Copies</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Availability Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  category === cat
                    ? "bg-amber-600 text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Available Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                setAvailableOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Results Count & Reset Filter */}
      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Showing <strong>{books.length}</strong> of <strong>{totalBooks}</strong> books
          {category !== "All" && ` in ${category}`}
          {availableOnly && " (available copies only)"}
        </span>
        {(search || category !== "All" || availableOnly) && (
          <button
            onClick={handleResetFilters}
            className="font-medium text-amber-600 hover:text-amber-700 underline dark:text-amber-400"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : books.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
          <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No books found matching your criteria
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Try adjusting your search terms or relaxing category and stock filters.
          </p>
          <div className="mt-6">
            <button
              onClick={handleResetFilters}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
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
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <span className="px-4 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        book={selectedBookForBorrow}
        isOpen={Boolean(selectedBookForBorrow)}
        onClose={() => setSelectedBookForBorrow(null)}
        onSuccess={fetchBooks}
      />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}

