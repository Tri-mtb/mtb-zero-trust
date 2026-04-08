"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, Search, Shield, LogOut, ShoppingCart, User, Settings, ChevronDown, X, Trash2, CheckCircle } from "lucide-react";
import { logout } from "@/app/login/actions";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// Ảnh fallback khi URL nào đó bị hỏng
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80";

// Map real images to our security products
const productImages: Record<string, string> = {
  "Zero Trust Firewall X1": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  "AI Threat Detector Pro": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  "Enterprise Gateway Router": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
  "Quantum Encryption Module": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  "Biometric Auth Token": "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?w=800&q=80",
  "DDoS Mitigation Appliance": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
  "Secure Enclave Server": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  "Zero-Knowledge VPN Gateway": "https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=800&q=80"
};

export default function StoreFront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Please log in to view products");
        }

        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const res = await fetch(`${gatewayUrl}/api/products`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load products");
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCheckoutSuccess(false);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError("");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in to checkout");

      const orderPayload = {
        total_amount: cartTotal,
        address: "Default Store Delivery Area", // Usually from user input
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const res = await fetch(`${gatewayUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process checkout");

      setCartItems([]);
      setCheckoutSuccess(true);
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <ShoppingBag className="w-5 h-5 text-neon-blue" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide hidden sm:block">TrustGuard <span className="text-neon-blue">Store</span></span>
          </div>
          
          <div className="flex-1 max-w-md mx-4 sm:mx-8 group relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Search secure products..." 
              className="w-full bg-slate-950/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Shopping Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                aria-label="Open shopping cart"
                title="Open shopping cart"
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-neon-blue text-slate-900 font-bold text-xs flex items-center justify-center rounded-full animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label={isProfileOpen ? "Close account menu" : "Open account menu"}
                title={isProfileOpen ? "Close account menu" : "Open account menu"}
                className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-bold text-white">Customer Account</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-3 h-3 text-neon-green" />
                      <p className="text-xs text-neon-green font-medium">Verified Identity</p>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800">
                    <form action={logout}>
                      <button type="submit" className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 flex items-center gap-3 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-white mb-4">Secure Infrastructure Store</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Upgrade your Zero Trust environment. Premium hardware and intelligent analysis software, shipped securely.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {products.map((product) => {
              const imageUrl = productImages[product.name] || FALLBACK_IMAGE;
              
              return (
                <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-neon-blue/40 transition-all hover:shadow-[0_8px_30px_rgba(0,240,255,0.15)] group flex flex-col">
                  {/* Product Image */}
                  <div className="aspect-[4/3] bg-slate-800 relative flex items-center justify-center overflow-hidden">
                     <Image 
                       src={imageUrl} 
                       alt={product.name}
                       fill
                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                       unoptimized
                       className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                     {/* Stock badge */}
                     <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700 text-xs font-semibold text-slate-300">
                        In Stock: {product.stock}
                     </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={product.name}>{product.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-3xl font-black text-white">
                        <span className="text-neon-blue text-xl mr-1">$</span>
                        {product.price.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-neon-blue/10 border border-neon-blue/50 hover:bg-neon-blue text-neon-blue hover:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Sliding Side Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full relative z-10 flex flex-col animate-in slide-in-from-right shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-neon-blue" /> Your Secure Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                aria-label="Close shopping cart"
                title="Close shopping cart"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
                  <div className="w-20 h-20 bg-neon-green/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-neon-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Security Cleared!</h3>
                  <p className="text-slate-400">Your order has been verified and securely processed through our gateway.</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); setCheckoutSuccess(false); }}
                    className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
                  <ShoppingCart className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Your cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const imageUrl = productImages[item.product.name] || FALLBACK_IMAGE;
                    
                    return (
                      <div key={item.product.id} className="flex gap-4 items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          unoptimized
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold truncate">{item.product.name}</h4>
                          <p className="text-neon-blue font-bold mb-2">${item.product.price.toLocaleString()}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2 py-1 text-slate-400 hover:text-white">-</button>
                              <span className="px-3 text-sm text-white font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2 py-1 text-slate-400 hover:text-white">+</button>
                            </div>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                aria-label={`Remove ${item.product.name} from cart`}
                                title={`Remove ${item.product.name} from cart`}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {checkoutError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg flex gap-2">
                       <X className="w-5 h-5 flex-shrink-0" /> {checkoutError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!checkoutSuccess && cartItems.length > 0 && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400 font-medium">Subtotal</span>
                  <span className="text-2xl font-black text-white">${cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-neon-blue hover:bg-cyan-400 text-slate-900 font-black py-4 rounded-xl text-lg flex justify-center items-center transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? "Processing securely..." : "Checkout via Gateway"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
