import { apiClient } from "@/lib/api-client";

export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  totalReviews: number;
  createdBy: string;
  creatorEmail: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BooksResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookFilters {
  search?: string;
  category?: string;
  available?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const bookService = {
  async getBooks(filters: BookFilters = {}): Promise<{ data: BooksResponse | null; error: string | null }> {
    const res = await apiClient<BooksResponse>("/books", {
      params: {
        search: filters.search,
        category: filters.category,
        available: filters.available ? "true" : undefined,
        createdBy: filters.createdBy,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    });
    return { data: res.data, error: res.error };
  },

  async getBookById(id: string): Promise<{ data: Book | null; error: string | null }> {
    const res = await apiClient<Book>(`/books/${id}`);
    return { data: res.data, error: res.error };
  },

  async createBook(book: {
    title: string;
    author: string;
    category: string;
    description: string;
    coverImage: string;
    totalCopies: number;
    availableCopies?: number;
  }): Promise<{ data: Book | null; error: string | null }> {
    const res = await apiClient<Book>("/books", {
      method: "POST",
      body: JSON.stringify(book),
    });
    return { data: res.data, error: res.error };
  },

  async updateBook(
    id: string,
    book: Partial<{
      title: string;
      author: string;
      category: string;
      description: string;
      coverImage: string;
      totalCopies: number;
    }>
  ): Promise<{ data: Book | null; error: string | null }> {
    const res = await apiClient<Book>(`/books/${id}`, {
      method: "PATCH",
      body: JSON.stringify(book),
    });
    return { data: res.data, error: res.error };
  },

  async deleteBook(id: string): Promise<{ success: boolean; error: string | null }> {
    const res = await apiClient(`/books/${id}`, {
      method: "DELETE",
    });
    return { success: !res.error, error: res.error };
  },
};
