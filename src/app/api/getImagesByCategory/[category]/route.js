import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  const urlParams = new URL(request.url).searchParams;
  const nextCursor = urlParams.get("next_cursor");

  // Set up Cloudinary search options
  const options = {
    expression: `folder:${category}`,
    with_field: "tags",
    max_results: 300,
    next_cursor: nextCursor || null,
  };

  try {
    // Fetch data from Cloudinary
    const result = await cloudinary.v2.search
      .expression(options.expression)
      .with_field(options.with_field)
      .max_results(options.max_results)
      .next_cursor(options.next_cursor)
      .execute();

    // Extract image data
    const images = result.resources.map((image) => ({
      public_id: image.public_id,
      secure_url: image.secure_url,
      tags: image.tags || [],
    }));

    // Return the images and next_cursor for pagination
    return NextResponse.json({
      images,
      next_cursor: result.next_cursor || null,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
