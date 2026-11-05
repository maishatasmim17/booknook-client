"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Book, bookService } from "@/services/book.service";
import { BookCard } from "@/components/books/BookCard";
import { EditBookModal } from "@/components/modals/EditBookModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function MyBooksPage() {
  const { data: session } = authClient.useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [selectedBookForDelete, setSelectedBookForDelete] = useState<Book | null>(null);

  const fetchMyBooks = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const res = await bookService.getBooks({
        createdBy: session.user.id,
        limit: 50,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.data?.books) {
        setBooks(res.data.books);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load your cataloged books");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-amber-600" />
            My Cataloged Books
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage the titles you have added to the BookNook library collection.
          </p>
        </div>

        <Link
          href="/add-book"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
          <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            You haven&apos;t added any books yet
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Share your favorite books with the community by cataloging your first title.
          </p>
          <div className="mt-6">
            <Link
              href="/add-book"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Book</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => {
            const id = book.id || (book as any)._id;
            return (
              <BookCard
                key={id}
                book={book}
                isOwner={true}
                onEditClick={(b) => setSelectedBookForEdit(b)}
                onDeleteClick={(b) => setSelectedBookForDelete(b)}
              />
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditBookModal
        book={selectedBookForEdit}
        isOpen={Boolean(selectedBookForEdit)}
        onClose={() => setSelectedBookForEdit(null)}
        onSuccess={fetchMyMyBooksWrapper(fetchMyBooks)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        book={selectedBookForDelete}
        isOpen={Boolean(selectedBookForDelete)}
        onClose={() => setSelectedBookForDelete(null)}
        onSuccess={fetchMyMyBooksWrapper(fetchMyBooks)}
      />
    </div>
  );
}

function fetchMyMyBooksWrapper(fn: () => void) {
  return () => {
    fn();
  };
}
