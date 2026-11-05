"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  BookOpen,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  Check,
  XCircle,
  Link as LinkIcon,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time password validation criteria:
  // Uppercase, lowercase, minimum 6 characters
  const passwordChecks = useMemo(() => {
    return {
      hasMinLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isFormValid =
    passwordChecks.hasMinLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase &&
    passwordChecks.passwordsMatch &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    photoUrl.trim().length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (photoUrl.trim() && !/^https?:\/\/.+/i.test(photoUrl.trim())) {
      setErrorMessage("Photo URL must be a valid link starting with http:// or https://");
      return;
    }
    if (!passwordChecks.hasMinLength) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (!passwordChecks.hasUppercase) {
      setErrorMessage("Password must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!passwordChecks.hasLowercase) {
      setErrorMessage("Password must contain at least one lowercase letter (a-z).");
      return;
    }
    if (!passwordChecks.passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await authClient.signUp.email({
        name,
        email,
        password,
        image: photoUrl.trim(),
      });

      if (res?.error) {
        setErrorMessage(res.error.message || "Registration failed. Please try again.");
        toast.error(res.error.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Please sign in to continue.");
      // Requirement: after registering, send the user to the Login page.
      await authClient.signOut();
      router.replace(
        `/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during registration.");
      toast.error(err?.message || "Registration failed");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      if (res?.error) {
        toast.error(res.error.message || "Google OAuth sign-in failed. Check Google credentials in .env.local.");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Google OAuth sign-in failed. Please verify GOOGLE_CLIENT_ID in client/.env.local.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-7 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Join BookNook
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Create an account to start discovering and borrowing books
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            {errorMessage}
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500 dark:text-neutral-400" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-neutral-400 dark:bg-neutral-900">
            Or create account with email
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Austen"
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@booknook.com"
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Photo URL
            </label>
            <div className="relative mt-1">
              <LinkIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="url"
                required
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-neutral-300 pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Password Validation Requirements Checklist */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-2 dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Password Requirements
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                {passwordChecks.hasMinLength ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-neutral-400" />
                )}
                <span
                  className={
                    passwordChecks.hasMinLength
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-neutral-500 dark:text-neutral-400"
                  }
                >
                  At least 6 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordChecks.hasUppercase ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-neutral-400" />
                )}
                <span
                  className={
                    passwordChecks.hasUppercase
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-neutral-500 dark:text-neutral-400"
                  }
                >
                  At least one uppercase letter (A-Z)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordChecks.hasLowercase ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-neutral-400" />
                )}
                <span
                  className={
                    passwordChecks.hasLowercase
                      ? "text-emerald-700 dark:text-emerald-400 font-medium"
                      : "text-neutral-500 dark:text-neutral-400"
                  }
                >
                  At least one lowercase letter (a-z)
                </span>
              </li>
              {confirmPassword.length > 0 && (
                <li className="flex items-center gap-2">
                  {passwordChecks.passwordsMatch ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span
                    className={
                      passwordChecks.passwordsMatch
                        ? "text-emerald-700 dark:text-emerald-400 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    Passwords match
                  </span>
                </li>
              )}
            </ul>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

