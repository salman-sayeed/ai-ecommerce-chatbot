import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

const SEED_PRODUCTS = [
  { name: "Classic White Tee", category: "t-shirt", price: 25, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", sizes: ["S", "M", "L", "XL"] },
  { name: "Vintage Black T-Shirt", category: "t-shirt", price: 28, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500", sizes: ["M", "L", "XL", "XXL"] },
  { name: "Sporty Crimson Jersey", category: "t-shirt", price: 32, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500", sizes: ["S", "M", "L"] },
  { name: "Oversized Sand Tee", category: "t-shirt", price: 30, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500", sizes: ["S", "M", "L", "XL", "XXL"] },
  { name: "Graphic Streetwear Shirt", category: "t-shirt", price: 35, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500", sizes: ["M", "L"] },
  
  { name: "Slim-Fit Charcoal Chinos", category: "pants", price: 45, image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500", sizes: ["S", "M", "L", "XL"] },
  { name: "Urban Cargo Trousers", category: "pants", price: 50, image: "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?w=500", sizes: ["M", "L", "XL"] },
  { name: "Classic Indigo Denim", category: "pants", price: 55, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", sizes: ["S", "M", "L", "XL", "XXL"] },
  { name: "Relaxed Heather Joggers", category: "pants", price: 38, image: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500", sizes: ["S", "M", "L"] },
  { name: "Tailored Khaki Pants", category: "pants", price: 48, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500", sizes: ["M", "L", "XL", "XXL"] }
];

export async function GET() {
  try {
    await connectDB();
    
    await Product.deleteMany({});
    
    const seeded = await Product.insertMany(SEED_PRODUCTS);
    
    return NextResponse.json({ success: true, message: `Successfully seeded ${seeded.length} products.` });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}