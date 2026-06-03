import React, { useState } from "react";
import { ShoppingBag, ShoppingCart, Plus, Minus, Search, Trash2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { Product, PaymentSettings } from "../types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopViewProps {
  products: Product[];
  cart: CartItem[];
  paymentSettings?: PaymentSettings;
  onUpdateCartQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onOpenCheckout: () => void;
}

export default function ShopView({
  products,
  cart,
  paymentSettings,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onAddToCart,
  onOpenCheckout
}: ShopViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCart = Array.isArray(cart) ? cart : [];

  // Derive item categories from products
  const productCategories = ["All", ...Array.from(new Set(safeProducts.map((p) => p.category)))];

  const filteredProducts = safeProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = safeCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemsCount = safeCart.reduce((acc, item) => acc + item.quantity, 0);

  const handleBuyNow = (prod: Product) => {
    const isProdInCart = safeCart.some((item) => item.product.id === prod.id);
    if (!isProdInCart) {
      onAddToCart(prod);
    }
    onOpenCheckout();
  };

  return (
    <div className="relative animate-fade-in">
      {/* Search and Category Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Internal search inside storefront */}
          <div className="relative min-w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search storefront..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans"
            />
          </div>

          {/* Quick Cart Trigger button */}
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="flex items-center gap-2 px-4.5 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-semibold shadow transition duration-150 cursor-pointer relative"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Store Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium font-sans">No products currently available</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting another category filter or resetting your query</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const inCart = cart.find((item) => item.product.id === prod.id);

            return (
              <div 
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-sm transition group"
              >
                {/* Product Cover image */}
                <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
                    {prod.category}
                  </div>
                </div>

                {/* Body details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans line-clamp-3">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-50 dark:border-slate-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-sans">
                        ₹{prod.price.toFixed(2)}
                      </span>

                      {/* Quantity selector or Add To Cart */}
                      {inCart ? (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1.5 gap-2.5">
                          <button
                            onClick={() => onUpdateCartQuantity(prod.id, -1)}
                            className="w-5 h-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-4 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateCartQuantity(prod.id, 1)}
                            className="w-5 h-5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 cursor-pointer text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(prod)}
                          className="px-3 py-1.5 bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                        >
                          Add To Cart
                        </button>
                      )}
                    </div>

                    {/* Direct Dynamic Order Flow */}
                    {prod.allowedCheckoutMode === 'chat_only' ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10 font-sans">
                          <span className="flex items-center gap-1">✨ Get Now 💬</span>
                          <span>Special Product</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const link = prod.messengerLink || paymentSettings?.messengerLink || "https://m.me";
                              window.open(link, "_blank", "noopener,noreferrer");
                            }}
                            className="py-2 bg-[#0084FF] hover:bg-[#0072DD] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center text-center transition-all duration-150 transform hover:scale-[1.02] cursor-pointer shadow-sm"
                          >
                            Chat on Messenger
                          </button>
                          <button
                            onClick={() => {
                              const link = prod.instagramLink || paymentSettings?.instagramLink || "https://instagram.com";
                              window.open(link, "_blank", "noopener,noreferrer");
                            }}
                            className="py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-95 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center text-center transition-all duration-150 transform hover:scale-[1.02] cursor-pointer shadow-sm"
                          >
                            Chat on Instagram
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition duration-150 cursor-pointer"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Side Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop gray Overlay */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl">
                  
                  {/* Header info */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-md font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-indigo-500" />
                      Shopping Cart
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cart Contents feed */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {safeCart.length === 0 ? (
                      <div className="text-center py-24">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 dark:text-slate-300 font-semibold font-sans text-sm">Your cart is empty</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Explore our product catalogs and claim exclusive materialpacks.</p>
                      </div>
                    ) : (
                      safeCart.map((item) => (
                        <div 
                          key={item.product.id}
                          className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 border border-slate-100 dark:border-slate-800 rounded-2xl relative"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-cover rounded-xl bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">
                              ₹{item.product.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200 font-sans">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateCartQuantity(item.product.id, -1)}
                                className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onUpdateCartQuantity(item.product.id, 1)}
                                className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onRemoveFromCart(item.product.id)}
                                className="p-0.5 hover:text-red-500 text-slate-400 cursor-pointer ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary checkout panel */}
                  {cart.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50 dark:bg-slate-900 space-y-4">
                      <div className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-md">
                          ₹{cartTotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex gap-2 p-3.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl items-start">
                        <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div className="text-[10.5px] leading-relaxed text-indigo-900 dark:text-indigo-300">
                          <span className="font-semibold">Secure Server Checkout Active:</span> All payment data is verified securely server-side. Transaction receipts sent directly to logistics.
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          onOpenCheckout();
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transform duration-155 cursor-pointer shadow-md hover:shadow-indigo-600/10"
                      >
                        Proceed To Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
