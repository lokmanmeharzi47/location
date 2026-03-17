import { NextResponse } from "next/server";
import { getImagesByCategory } from "@/lib/imageStorage";

// Handle GET requests
export async function GET(request, context) {
  const { category } = await context.params;

  // Check if category is provided
  if (!category) {
    return NextResponse.json(
      { message: "Category is missing" },
      { status: 400 }
    );
  }

  // Validate category against the allowed ones
  const validCategories = ["dresses", "tops", "sets", "sweaters"];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { message: "Invalid category" },
      { status: 400 }
    );
  }

  // Parse pagination from query params
  const urlParams = new URL(request.url).searchParams;
  const page = parseInt(urlParams.get("page") || "1", 10);

  try {
    // Fetch data from local storage
    const result = getImagesByCategory(category, page, 20);

    // Return the images and next_cursor for pagination
    return NextResponse.json({
      images: result.images,
      next_cursor: result.next_cursor,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
