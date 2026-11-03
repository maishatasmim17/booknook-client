"use client";

import React, { useState, useEffect } from "react";
import { Book, bookService } from "@/services/book.service";
import { uploadToImgbb } from "@/services/image-upload.service";
import { toast } from "sonner";
import {
  X,
  BookOpen,
  Upload,
  Link as LinkIcon,
  Loader2,
  Check,
} from "lucide-react";

interface EditBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

export function EditBookModal({
  book,
  isOpen,
  onClose,
  onSuccess,
}: EditBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState(1);
  const [coverImage, setCoverImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title || "");
      setAuthor(book.author || "");
      setCategory(book.category || "Fiction");
      setDescription(book.description || "");
      setTotalCopies(book.totalCopies || 1);
      setCoverImage(book.coverImage || "");
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const bookId = book.id || (book as any)._id;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadToImgbb(file);
      if (res.error) {
        toast.error(res.error);
      } else if (res.url) {
        setCoverImage(res.url);
        toast.success("Cover image uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !author || !category || !description || !coverImage) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookService.updateBook(bookId, {
        title,
        author,
        category,
        description,
        totalCopies: Number(totalCopies),
        coverImage,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`"${title}" was updated successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Edit Book Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Author *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Category / Genre *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Total Copies in Library *
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(parseInt(e.target.value, 10) || 1)}
                className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Cover Image Upload / URL Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Book Cover Image *
            </label>
            <div className="mt-1 flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                {coverImage ? (
                  <img src={coverImage} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 p-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  ) : (
                    <Upload className="h-4 w-4 text-neutral-400" />
                  )}
                  <span>{uploadingImage ? "Uploading to imgbb..." : "Upload New Cover Image (imgbb)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (https://...)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

