/**
 * Utility service to handle image uploads to imgbb API
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

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey || apiKey === "your_imgbb_api_key") {
      return {
        url: null,
        error:
          "Image upload is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to client/.env.local, or paste a direct image URL instead.",
      };
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        url: null,
        error: data?.error?.message || "Failed to upload image to imgbb",
      };
    }

    const imageUrl = data.data.url || data.data.display_url;
    return { url: imageUrl, error: null };
  } catch (error: any) {
    return {
      url: null,
      error: error?.message || "An error occurred during image upload",
    };
  }
}

