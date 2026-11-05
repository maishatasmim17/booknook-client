"use client";

import React from "react";
import Link from "next/link";
import { Book } from "@/services/book.service";
import { BookOpen, Star, User } from "lucide-react";

interface BookCardProps {
  book: Book;
  onBorrowClick?: (book: Book) => void;
  onEditClick?: (book: Book) => void;
  onDeleteClick?: (book: Book) => void;
  isOwner?: boolean;
}

export function BookCard({
  book,
  onBorrowClick,
  onEditClick,
  onDeleteClick,
  isOwner = false,
}: BookCardProps) {
  const id = book.id || book._id || "";
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        {/* Cover Image & Badges */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-neutral-400">
              <BookOpen className="h-12 w-12 text-amber-600/70" />
              <span className="mt-2 text-xs font-medium line-clamp-2">{book.title}</span>
            </div>
          )}

          {/* Stock Availability Pill */}
          <div className="absolute left-2.5 top-2.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-md ${
                isAvailable
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {isAvailable ? `${book.availableCopies} in stock` : "Out of Stock"}
            </span>
          </div>

          {/* Category Pill */}
          <div className="absolute right-2.5 top-2.5">
            <span className="inline-flex items-center rounded-full bg-neutral-900/75 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
              {book.category}
            </span>
          </div>
        </div>

        {/* Book Info */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[140px]">{book.author}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {book.rating ? Number(book.rating).toFixed(1) : "New"}
            </span>
          </div>

          <Link href={`/books/${id}`} className="mt-1.5 block">
            <h3 className="text-base font-bold text-neutral-900 transition hover:text-amber-600 dark:text-neutral-100 dark:hover:text-amber-500 line-clamp-1">
              {book.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Link
            href={`/books/${id}`}
            className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            View Details
          </Link>

          {onBorrowClick && (
            <button
              onClick={() => onBorrowClick(book)}
              disabled={!isAvailable}
              className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              title={!isAvailable ? "No copies available" : "Borrow this book"}
            >
              {isAvailable ? "Borrow This Book" : "Not Available"}
            </button>
          )}

          {isOwner && onEditClick && (
            <button
              onClick={() => onEditClick(book)}
              className="rounded-lg border border-neutral-300 px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Edit
            </button>
          )}

          {isOwner && onDeleteClick && (
            <button
              onClick={() => onDeleteClick(book)}
              className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

