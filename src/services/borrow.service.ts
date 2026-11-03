import { apiClient } from "@/lib/api-client";
import { Book } from "./book.service";

export interface BorrowRecord {
  id: string;
  _id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  bookId: string | Book;
  bookTitle: string;
  bookCoverImage?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: "borrowed" | "returned";
  createdAt: string;
  updatedAt: string;
}

export const borrowService = {
  async borrowBook(bookId: string, dueDate: string): Promise<{ data: any | null; error: string | null }> {
    const res = await apiClient("/borrows", {
      method: "POST",
      body: JSON.stringify({ bookId, dueDate }),
    });
    return { data: res.data, error: res.error };
  },

  async getBorrows(status?: "borrowed" | "returned"): Promise<{ data: BorrowRecord[] | null; error: string | null }> {
    const res = await apiClient<BorrowRecord[]>("/borrows", {
      params: { status },
    });
    return { data: res.data, error: res.error };
  },

  async returnBorrow(borrowId: string): Promise<{ success: boolean; error: string | null }> {
    const res = await apiClient(`/borrows/${borrowId}`, {
      method: "DELETE",
    });
    return { success: !res.error, error: res.error };
  },
};
