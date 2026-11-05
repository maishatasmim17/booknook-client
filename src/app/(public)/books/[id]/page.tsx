"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Book, bookService } from "@/services/book.service";
import { BorrowModal } from "@/components/modals/BorrowModal";
import { EditBookModal } from "@/components/modals/EditBookModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";
import {
  BookOpen,
  User,
  Star,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Share2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function BookDetailView({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session } = authClient.useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await bookService.getBookById(id);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setBook(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-neutral-400" />
        <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Book Not Found
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          The requested title does not exist or may have been removed from the library catalog.
        </p>
        <div className="mt-6">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const currentUserId = session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "admin";
  const isOwner = Boolean(currentUserId && book.createdBy === currentUserId) || isAdmin;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb / Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Books</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Book</span>
        </button>
      </div>

      {/* Main Book Detail Layout */}
      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-12">
        {/* Left Column: Book Cover & Quick Meta */}
        <div className="md:col-span-4 lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xl dark:border-neutral-800 dark:bg-neutral-800">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-neutral-400">
                <BookOpen className="h-16 w-16 text-amber-600/60" />
                <span className="mt-3 text-sm font-semibold">{book.title}</span>
              </div>
            )}
          </div>

          {/* Quick Details Box */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Category
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {book.category}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Total Copies
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {book.totalCopies} {book.totalCopies === 1 ? "copy" : "copies"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Available on Shelf
              </span>
              <span
                className={`font-bold ${
                  isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}
              >
                {book.availableCopies} available
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Cataloged On
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {new Date(book.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Added By */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Added to the Library By
            </h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {book.creatorName || book.creatorEmail?.split("@")[0] || "BookNook Member"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{book.creatorEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Book Info, Description & Actions */}
        <div className="md:col-span-8 lg:col-span-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <span>{book.category}</span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              {book.title}
            </h1>

            <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              <span>Written by <strong className="text-neutral-900 dark:text-neutral-100">{book.author}</strong></span>
            </p>
          </div>

          {/* Availability Banner */}
          <div
            className={`flex items-center justify-between rounded-2xl p-4 border ${
              isAvailable
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50/80 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {isAvailable ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">
                  {isAvailable
                    ? `Available to Borrow (${book.availableCopies} of ${book.totalCopies} copies ready)`
                    : "Currently Out of Stock"}
                </p>
                <p className="text-xs opacity-80">
                  {isAvailable
                    ? "Reserve and check out this copy to your member dashboard immediately."
                    : "All copies of this title are currently loaned out. Please check back soon."}
                </p>
              </div>
            </div>

            {/* Borrow Action Trigger */}
            <button
              onClick={() => {
                if (!session?.user) {
                  toast.error("Please sign in to borrow books");
                  router.push(
                    `/login?callbackUrl=${encodeURIComponent(`/books/${id}`)}`
                  );
                  return;
                }
                setIsBorrowModalOpen(true);
              }}
              disabled={!isAvailable}
              className="ml-4 shrink-0 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAvailable ? "Borrow This Book" : "Not Available"}
            </button>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Synopsis & Overview
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>

          {/* Creator & Admin Actions (Edit / Delete) */}
          {isOwner && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Book Management Controls
              </h4>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                You added this title to the library catalog. You can edit its inventory or metadata, or remove it from the collection.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  <Edit className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  <span>Edit Book Details</span>
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-900 dark:bg-neutral-800 dark:text-red-400 dark:hover:bg-red-950/50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Book</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BorrowModal
        book={book}
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={fetchBook}
      />

      <EditBookModal
        book={book}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchBook}
      />

      <DeleteConfirmModal
        book={book}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          router.push("/books");
        }}
      />
    </div>
  );
}

export default function BookDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <BookDetailView {...props} />
    </Suspense>
  );
}
