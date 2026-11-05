"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { bookService } from "@/services/book.service";
import { uploadToImgbb } from "@/services/image-upload.service";
import { toast } from "sonner";
import {
  BookOpen,
  Upload,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"];

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [totalCopies, setTotalCopies] = useState(1);
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        toast.success("Cover image uploaded successfully to imgbb!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please log in to add a book");
      router.push("/login?callbackUrl=/add-book");
      return;
    }

    if (!title.trim() || !author.trim() || !category || !description.trim() || !coverImage.trim()) {
      toast.error("Please fill in all required fields and provide a cover image.");
      return;
    }

    if (totalCopies < 1) {
      toast.error("Total copies must be at least 1.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookService.createBook({
        title: title.trim(),
        author: author.trim(),
        category,
        description: description.trim(),
        totalCopies: Number(totalCopies),
        coverImage: coverImage.trim(),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`"${title}" was added to the library catalog!`);
      const newBookId = res.data?.id || (res.data as any)?._id;
      if (newBookId) {
        router.push(`/books/${newBookId}`);
      } else {
        router.push("/books");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-amber-600 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Library Catalog</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
          <BookOpen className="h-8 w-8 text-amber-600" />
          Add a New Book to the Library
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Catalog a new title into the BookNook collection. Fill in the metadata and upload a cover image via imgbb.
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Author */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Book Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. To Kill a Mockingbird"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Author *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Harper Lee"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Owner Info (read-only, from logged-in user) */}
          <div className="grid grid-cols-1 gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-950/40">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Your Name
              </label>
              <input
                type="text"
                readOnly
                value={session?.user?.name || (isPending ? "Loading..." : "")}
                className="mt-2 block w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Your Email
              </label>
              <input
                type="email"
                readOnly
                value={session?.user?.email || (isPending ? "Loading..." : "")}
                className="mt-2 block w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
              />
            </div>
          </div>

          {/* Category & Total Copies */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Genre / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Total Copies in Library *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(parseInt(e.target.value, 10) || 1)}
                className="mt-2 block w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                All copies will immediately be available for loan upon creation.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Book Description / Synopsis *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a compelling overview of the book's narrative, themes, or educational value..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Cover Image Upload via imgbb API */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Book Cover Image * (Upload via imgbb)
            </label>
            <div className="mt-2 flex flex-col sm:flex-row gap-5 items-start">
              {/* Preview Box */}
              <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 shadow-inner">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-xs text-neutral-400">
                    <BookOpen className="h-8 w-8 text-neutral-300" />
                    <span className="mt-1 text-[11px]">No cover selected</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <label className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-neutral-300 p-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  {uploadingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-amber-600" />
                  )}
                  <span>
                    {uploadingImage ? "Uploading to imgbb..." : "Choose Image File to Upload (imgbb)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="url"
                    placeholder="Or enter direct image URL (https://images.unsplash.com/...)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="block w-full rounded-xl border border-neutral-300 pl-10 pr-4 py-2 text-xs focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Submit CTA */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
            <Link
              href="/books"
              className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Add Book to Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

