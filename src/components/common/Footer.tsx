"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "X",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.45-4.94 8.45-9.94z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M12 .297a12 12 0 00-3.797 23.4c.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 016 0c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57A12.02 12.02 0 0024 12.297c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
];

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shadow-amber-600/30">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Book<span className="text-amber-600">Nook</span>
                </span>
                <span className="block -mt-1 text-[10px] font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Online Library
                </span>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              A cozy digital library where readers can catalog books, borrow copies for a few
              days, and return them with a single click.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-amber-600 hover:bg-amber-600 hover:text-white dark:border-neutral-800 dark:text-neutral-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/" className="transition hover:text-amber-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/books" className="transition hover:text-amber-600">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/my-borrows" className="transition hover:text-amber-600">
                  My Borrows
                </Link>
              </li>
              <li>
                <Link href="/add-book" className="transition hover:text-amber-600">
                  Add a Book
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <a href="mailto:support@booknook.com" className="hover:text-amber-600">
                  support@booknook.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <a href="tel:+8801700000000" className="hover:text-amber-600">
                  +880 1700-000000
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:text-neutral-400 dark:border-neutral-800 sm:flex-row">
          <p>&copy; {year ?? 2026} BookNook. All rights reserved.</p>
          <p>Built with Next.js, Better Auth &amp; Express.</p>
        </div>
      </div>
    </footer>
  );
}
