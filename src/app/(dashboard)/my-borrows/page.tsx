"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { borrowService, BorrowRecord } from "@/services/borrow.service";
import { toast } from "sonner";
import {
  Library,
  BookOpen,
  Loader2,
  RotateCcw,
} from "lucide-react";

function BorrowsView() {
  const { data: session } = authClient.useSession();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getBorrows();
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setBorrows(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load borrow records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchBorrows();
    }
  }, [session]);

  const handleReturn = async (id: string, title: string) => {
    try {
      setReturningId(id);
      const res = await borrowService.returnBorrow(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully returned "${title}" to the library!`, {
          description: "Inventory copies have been updated.",
        });
        setBorrows((prev) => prev.filter((b) => b.id !== id && (b as any)._id !== id));
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to return book");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
            <Library className="h-8 w-8 text-amber-600" />
            My Borrowed Books & Loans
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track your current reading loans, due dates, and return books when you finish reading.
          </p>
        </div>

        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700"
        >
          <BookOpen className="h-4 w-4" />
          <span>Browse More Titles</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : borrows.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
          <Library className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            You have no active loans
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Explore our collection to borrow your next favorite story.
          </p>
          <div className="mt-6">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
            >
              <span>Explore Books</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
            <thead className="bg-neutral-50 dark:bg-neutral-950/40">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Borrow Date
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Return Date
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Return Book
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {borrows.map((record) => {
                const id = record.id || (record as any)._id;
                const borrowDate = new Date(record.borrowDate);
                const returnDate = new Date(record.returnDate || record.dueDate);
                const isOverdue = returnDate.getTime() < Date.now();

                return (
                  <tr key={id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-4">
                      {record.bookCoverImage ? (
                        <img
                          src={record.bookCoverImage}
                          alt={record.bookTitle}
                          className="h-16 w-12 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800"
                        />
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <BookOpen className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                        {record.bookTitle}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                      {borrowDate.toLocaleDateString()}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 text-sm font-semibold ${
                        isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-neutral-700 dark:text-neutral-200"
                      }`}
                    >
                      {returnDate.toLocaleDateString()}
                      {isOverdue && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700 dark:bg-red-950 dark:text-red-400">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <button
                        onClick={() => handleReturn(id, record.bookTitle)}
                        disabled={returningId === id}
                        className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                      >
                        {returningId === id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span>Return Book</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MyBorrowsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <BorrowsView />
    </Suspense>
  );
}
