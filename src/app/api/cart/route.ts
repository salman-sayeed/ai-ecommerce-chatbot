import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";

interface ICartItem {
  productId: { toString: () => string } | string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

//authh
interface AuthenticatedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string; 
}

//active cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthenticatedUser | undefined;
      
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = user.id;
    // const userId = "65f000000000000000000001"; 
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

//add item
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthenticatedUser | undefined;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, name, price, size, quantity = 1 } = await req.json();
    if (!productId || !name || !price || !size) {
      return NextResponse.json({ error: "Missing item attributes" }, { status: 400 });
    }

    await connectDB();
    const userId = user.id;
    //const userId = "65f000000000000000000001"; 

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: ICartItem) => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, size, quantity });
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}