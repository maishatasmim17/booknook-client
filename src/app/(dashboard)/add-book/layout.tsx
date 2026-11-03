import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Book",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
