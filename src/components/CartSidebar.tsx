'use client';

import { useState, useEffect } from "react";

interface ICartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
}

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success && data.cart) {
        setItems(data.cart.items || []);
      }
    } catch (err) {
      console.error("Failed to load cart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 💥 Added handler to clear specific item variant via backend route
  const handleRemoveItem = async (productId: string, size: string) => {
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleOpenSidebar = () => {
    setIsOpen(true);
    fetchCart();
  };

  // Custom events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener("refreshCart", handleCartUpdate);
    return () => window.removeEventListener("refreshCart", handleCartUpdate);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      {/* Cart Trigger Button */}
      <button
        onClick={handleOpenSidebar}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors whitespace-nowrap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        Cart ({totalItems})
      </button>

      {/* Slide-out Overlay Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Your Cart Inventory</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {loading ? (
                <p className="text-center text-sm text-gray-400 pt-10 animate-pulse">Loading cart items...</p>
              ) : items.length === 0 ? (
                <p className="text-center text-sm text-gray-400 pt-10">Your shopping cart is currently empty.</p>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Size: <span className="font-bold text-gray-700">{item.size}</span> | Qty: {item.quantity}</p>
                    </div>
                    
                    {/* 💥 Modified to stack price and cross icon side-by-side inside the row */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">${item.price * item.quantity}</span>
                      <button 
                        onClick={() => handleRemoveItem(item.productId, item.size)}
                        className="text-gray-400 hover:text-red-500 p-1 transition rounded hover:bg-gray-200/50"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pricing */}
            {!loading && items.length > 0 && (
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between items-center text-base font-bold text-gray-900">
                  <span>Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}