/**
 * Uploads a book cover to imgbb through the app's own /api/upload route.
 *
 * The route keeps the imgbb API key on the server, so only IMGBB_API_KEY (or
 * the legacy NEXT_PUBLIC_IMGBB_API_KEY) is required in client/.env.local.
 */
export async function uploadToImgbb(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        url: null,
        error: "Please upload a valid image file (JPEG, PNG, WebP, or GIF)",
      };
    }

    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        url: null,
        error: "Image file size exceeds the 5MB limit",
      };
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        url: null,
        error:
          data?.error ||
          "Failed to upload image. You can paste a direct image URL instead.",
      };
    }

    if (!data?.url) {
      return {
        url: null,
        error: "The upload succeeded but no image URL was returned.",
      };
    }

    return { url: data.url, error: null };
  } catch (error: any) {
    return {
      url: null,
      error: error?.message || "An error occurred during image upload",
    };
  }
}
