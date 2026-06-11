'use client';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
}

export default function AddToCartButton({ productId, name, price }: AddToCartButtonProps) {
  const handleAddToCart = async () => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name,
          price,
          size: "M", 
          quantity: 1,
        }),
      });

  
      window.dispatchEvent(new Event("refreshCart"));
    } catch (err) {
      console.error("Failed to add product to cart:", err);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-md transition duration-200 shadow-sm block text-center"
    >
      Add to Cart
    </button>
  );
}