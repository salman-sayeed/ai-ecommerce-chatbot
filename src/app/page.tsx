import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import SignOutButton from "@/components/SignOutButton"; 
import ChatAssistant from "@/components/ChatAssistant";
import CartSidebar from "@/components/CartSidebar";
import AddToCartButton from "@/components/AddToCartButton";

interface IProduct {
  _id: { toString: () => string }; 
  name: string;
  category: string;
  price: number;
  image: string;
  sizes: string[];
}

async function getProducts(): Promise<IProduct[]> {
  await connectDB();
  const data = await Product.find({}).lean();
  return data as unknown as IProduct[];
}

export default async function HomePage() {
  const products = await getProducts();
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 pb-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KIORI IRO</h1>
              <p className="text-sm text-gray-500">Your onestop lifestyle brand</p>
            </div>
            
            {/* Nav Container  */}
            <div className="flex items-center justify-end gap-4 min-w-[300px]">
              {session && (
                <div className="flex items-center gap-3">
                  {/* Greetings */}
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                    Hi, <strong className="text-gray-900">{session.user?.name}</strong>
                  </span>

                  {/* Sign Out button */}
                  <SignOutButton />
                </div>
              )}

              {!session && (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/login" 
                    className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Cart button */}
              <div className="relative flex items-center shrink-0">
                <CartSidebar />
              </div>
            </div>
          </header>

        {/* Catalog Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: IProduct) => (
            <div key={product._id.toString()} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="h-64 bg-gray-200 relative">
                <Image 
                  src={product.image} 
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  priority={true} 
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                  <span className="text-sm font-bold text-gray-900">${product.price}</span>
                </div>
                <p className="text-xs uppercase font-medium text-gray-400 tracking-wider">{product.category}</p>
                
                <div className="pt-2 flex flex-wrap gap-1">
                  {["S", "M", "L", "XL", "XXL"].map((size) => {
                    const isAvailable = product.sizes.includes(size);
                    return (
                      <span 
                        key={size} 
                        className={`text-[10px] px-1.5 py-0.5 font-bold rounded border ${
                          isAvailable 
                            ? "bg-gray-50 text-gray-600 border-gray-200" 
                            : "bg-gray-100 text-gray-300 border-gray-100 line-through"
                        }`}
                      >
                        {size}
                      </span>
                    );
                  })}
                </div>
                <AddToCartButton 
                  productId={product._id.toString()} 
                  name={product.name} 
                  price={product.price} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ChatAssistant */}
      <ChatAssistant />
    </main>
  );
}