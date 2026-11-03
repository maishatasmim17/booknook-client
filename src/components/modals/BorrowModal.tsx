"use client";

import React, { useState, useEffect } from "react";
import { Book } from "@/services/book.service";
import { borrowService } from "@/services/borrow.service";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, Calendar, Clock, BookOpen, Loader2, CheckCircle2 } from "lucide-react";

interface BorrowModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BorrowModal({ book, isOpen, onClose, onSuccess }: BorrowModalProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [days, setDays] = useState(14);
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [dueDateString, setDueDateString] = useState("");
  const [minDateString, setMinDateString] = useState("");
  const [maxDateString, setMaxDateString] = useState("");

  useEffect(() => {
    const now = Date.now();
    const target = customDate ? new Date(customDate) : new Date(now + days * 24 * 60 * 60 * 1000);
    setDueDateString(target.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" }));
    setMinDateString(new Date(now + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setMaxDateString(new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  }, [customDate, days]);

  if (!isOpen || !book) return null;

  const bookId = book.id || (book as any)._id;

  const getIsoDueDate = () => {
    return customDate
      ? new Date(customDate).toISOString()
      : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  };

  const handleBorrow = async () => {
    if (!session) {
      toast.error("Please sign in to borrow books");
      router.push(`/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }

    if (book.availableCopies <= 0) {
      toast.error("Sorry, this book is currently out of stock");
      return;
    }

    try {
      setLoading(true);
      const isoDueDate = getIsoDueDate();
      const res = await borrowService.borrowBook(bookId, isoDueDate);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`You have successfully borrowed "${book.title}"!`, {
        description: `Please return it by ${dueDateString}.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to borrow book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Borrow Book
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Book Preview */}
        <div className="mt-4 flex gap-4 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-24 w-16 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <BookOpen className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {book.category}
            </span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
              {book.title}
            </h4>
            <p className="text-xs text-neutral-500">by {book.author}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {book.availableCopies} of {book.totalCopies} available
              </span>
            </div>
          </div>
        </div>

        {/* Borrower Info (read-only, from logged-in user) */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              User Name
            </label>
            <input
              type="text"
              readOnly
              value={session?.user?.name || ""}
              placeholder="Not signed in"
              className="mt-1 block w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              User Email
            </label>
            <input
              type="email"
              readOnly
              value={session?.user?.email || ""}
              placeholder="Not signed in"
              className="mt-1 block w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
            />
          </div>
        </div>

        {/* Loan Duration Selector */}
        <div className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Select Loan Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDays(d);
                  setCustomDate("");
                }}
                className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                  days === d && !customDate
                    ? "border-amber-600 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {d} Days Loan
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Or pick an exact return date
            </label>
            <div className="relative mt-1">
              <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="date"
                min={minDateString}
                max={maxDateString}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Due date summary */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Expected Return Date: <strong>{dueDateString}</strong>
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBorrow}
            disabled={loading || book.availableCopies <= 0}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>Confirm Borrow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
