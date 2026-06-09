import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Cart } from "@/models/Cart";

//cart
interface ICartItem {
  productId: { toString: () => string } | string;
  size: string;
  name: string;
  price: number;
  quantity: number;
}


interface AuthenticatedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthenticatedUser | undefined;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, size } = await req.json();
    if (!productId || !size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const userId = user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }


    cart.items = cart.items.filter(
      (item: ICartItem) => !(item.productId.toString() === productId && item.size === size)
    );

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}