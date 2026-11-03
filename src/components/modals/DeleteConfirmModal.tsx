"use client";

import React, { useState } from "react";
import { Book, bookService } from "@/services/book.service";
import { toast } from "sonner";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteConfirmModal({
  book,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !book) return null;

  const bookId = book.id || (book as any)._id;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await bookService.deleteBook(bookId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`"${book.title}" was deleted from the library.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Delete Book?
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Are you sure you want to delete <strong className="text-neutral-800 dark:text-neutral-200">&ldquo;{book.title}&rdquo;</strong>? This action cannot be undone.
            </p>
            {book.totalCopies !== book.availableCopies && (
              <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                Note: Deletion will be rejected if there are currently borrowed copies.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>Delete Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}

