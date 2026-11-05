import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// imgbb accepts files up to 32MB, but we keep the app limit small and predictable.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/upload
 *
 * Server-side proxy for imgbb so the API key never has to be exposed with a
 * NEXT_PUBLIC_ prefix. Configure either IMGBB_API_KEY (preferred) or the
 * legacy NEXT_PUBLIC_IMGBB_API_KEY in client/.env.local.
 */
export async function POST(request: Request) {
  try {
    const apiKey =
      process.env.IMGBB_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();

    if (!apiKey || apiKey === "your_imgbb_api_key") {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. Add IMGBB_API_KEY to client/.env.local (get a free key at https://api.imgbb.com/), restart the dev server, or paste a direct image URL instead.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file was provided." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected image file is empty." },
        { status: 400 }
      );
    }

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Please upload a valid image file (JPEG, PNG, WebP, or GIF).",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", file);

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: imgbbFormData,
        signal: AbortSignal.timeout(30_000),
      }
    );

    const imgbbData = await imgbbResponse.json().catch(() => null);

    if (!imgbbResponse.ok || !imgbbData?.success) {
      return NextResponse.json(
        {
          error:
            imgbbData?.error?.message ||
            "Failed to upload the image to imgbb. Please try again.",
        },
        { status: 502 }
      );
    }

    const imageUrl = imgbbData?.data?.url || imgbbData?.data?.display_url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imgbb did not return an image URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    if (error?.name === "TimeoutError") {
      return NextResponse.json(
        { error: "The imgbb upload timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "An error occurred during image upload." },
      { status: 500 }
    );
  }
}
