'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PawPrint, Search, ShoppingBag, Filter, Star, Heart, CheckCircle2, 
  ArrowRight, ShieldCheck, Truck, Stethoscope, Sparkles, X, 
  ChevronRight, Info, AlertCircle, User, LogIn, UserPlus, ExternalLink,
  PackageCheck, HelpCircle, Eye, Tag, Phone, Check, Clock, Award,
  HeartHandshake, ChevronDown, CheckCircle, LogOut, ShoppingCart, Trash2, Plus, Minus, RotateCw, QrCode
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProducts, getShopMetadata, Product, ShopMetadataResponse 
} from '@/lib/api/products';
import { createOrder } from '@/lib/api/orders';
import { getRoleDashboardPath, getRoleBadge } from '@/components/layout/QuickPortalNav';
import VietQRPaymentModal, { BANK_INFO } from '@/components/ui/VietQRPaymentModal';

export interface CartItem {
  product: Product;
  quantity: number;
}

export default function PublicShopPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [metadata, setMetadata] = useState<ShopMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPet, setSelectedPet] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('popular');
  
  // Shopping Cart & Auth Guard State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState<boolean>(false);
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState<boolean>(false);
  const [pendingItem, setPendingItem] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK'>('COD');

  // Modals & Order Processing
  const [selectedItemDetail, setSelectedItemDetail] = useState<Product | null>(null);
  const [orderModalItem, setOrderModalItem] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);
  const [createdOrderAmount, setCreatedOrderAmount] = useState<number>(0);
  const [isVietQRModalOpen, setIsVietQRModalOpen] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Cart with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('petcare_shopping_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    try {
      localStorage.setItem('petcare_shopping_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex(c => c.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity }];
    }
    saveCart(updated);
    showToast(`🛒 Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCart(updated);
    showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  const clearCart = () => {
    saveCart([]);
    showToast('🗑️ Đã dọn sạch giỏ hàng.');
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Initiate purchase for single item (Requires authentication!)
  const handleInitiateSinglePurchase = (product: Product) => {
    if (!isAuthenticated) {
      setPendingItem(product);
      setIsAuthRequiredModalOpen(true);
      return;
    }
    handleOpenOrder(product);
  };

  // Initiate purchase for entire cart (Requires authentication!)
  const handleInitiateCartPurchase = () => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      setPendingItem(null);
      setIsCartOpen(false);
      setIsAuthRequiredModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCartCheckoutOpen(true);
    setOrderSuccess(false);
    setCustomerName(user?.full_name || '');
    setCustomerPhone(user?.phone || '');
  };

  // Confirm Cart Order (When logged in)
  const handleConfirmCartOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOrder) return;
    if (!customerPhone.trim() || !customerAddress.trim()) {
      alert('Vui lòng nhập đầy đủ số điện thoại và địa chỉ nhận hàng!');
      return;
    }
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const order = await createOrder({
        customer_name: customerName.trim() || user?.full_name || 'Khách hàng',
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        notes: orderNotes.trim() || undefined,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      });

      const finalAmount = order.final_amount || (cartTotalPrice >= 300000 ? cartTotalPrice : cartTotalPrice + 30000);
      setCreatedOrderCode(order.order_code);
      setCreatedOrderAmount(finalAmount);
      setOrderSuccess(true);
      clearCart();
      if (paymentMethod === 'BANK') {
        setIsVietQRModalOpen(true);
      }
      showToast(`🎉 Đặt hàng thành công! Mã đơn: #${order.order_code}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Lỗi khi đặt hàng!';
      alert(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [metaData, prodData] = await Promise.all([
        getShopMetadata(),
        getProducts({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          target_pet: selectedPet === 'ALL' ? undefined : selectedPet,
          brand: selectedBrand === 'ALL' ? undefined : selectedBrand,
          search: searchQuery.trim() || undefined,
          sort_by: sortBy,
          limit: 100
        })
      ]);
      setMetadata(metaData);
      setProducts(prodData.items);
    } catch (err) {
      console.error('Failed to load shop data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedPet, selectedBrand, sortBy, searchQuery]);

  // Format currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Open Order Modal
  const handleOpenOrder = (product: Product) => {
    setOrderModalItem(product);
    setOrderQuantity(1);
    setOrderSuccess(false);
    setCustomerName(user?.full_name || '');
    setCustomerPhone(user?.phone || '');
  };

  // Submit Order
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModalItem) return;
    if (isSubmittingOrder) return;
    if (!customerPhone.trim() || !customerAddress.trim()) {
      alert('Vui lòng nhập đầy đủ số điện thoại và địa chỉ nhận hàng!');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const order = await createOrder({
        customer_name: customerName.trim() || user?.full_name || 'Khách hàng',
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        notes: orderNotes.trim() || undefined,
        payment_method: paymentMethod,
        items: [
          {
            product_id: orderModalItem.id,
            quantity: orderQuantity
          }
        ]
      });

      const finalAmount = order.final_amount || (orderModalItem.price * orderQuantity);
      setCreatedOrderCode(order.order_code);
      setCreatedOrderAmount(finalAmount);
      setOrderSuccess(true);
      if (paymentMethod === 'BANK') {
        setIsVietQRModalOpen(true);
      }
      showToast(`🎉 Đặt hàng thành công! Mã đơn: #${order.order_code}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Lỗi khi đặt hàng!';
      alert(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Categorize for special sections
  const petListings = useMemo(() => {
    return products.filter(p => p.category === 'PET');
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-emerald-400 border border-emerald-500/30 shadow-2xl flex items-center gap-3 text-sm font-bold animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white text-xs font-semibold py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              HOT SALE
            </span>
            <span className="truncate">Miễn phí giao tận nhà cho đơn từ 300.000₫ • Bảo hành sức khỏe thú cưng thuần chủng 30 ngày!</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Hotline: <strong className="text-amber-300">1900 8888</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% Kiểm Định Thú Y</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <PawPrint className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-950">PetCare</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase">STORE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">Siêu Thị Thú Cưng & Dinh Dưỡng</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mua chó cảnh, mèo cảnh, hạt Royal Canin, pate Whiskas, đồ chơi KONG..."
                className="w-full pl-11 pr-10 py-2.5 text-sm bg-slate-100/90 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & User Status */}
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="text-xs font-bold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors hidden lg:block"
            >
              Trang Chủ
            </Link>

            <Link 
              href="/pet/emergency/demo"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-full transition-colors hidden sm:flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Cấp Cứu 24/7</span>
            </Link>

            {/* My Orders / Tracking Shortcut */}
            <Link
              href="/customer/orders"
              className="relative p-2 sm:px-3 sm:py-2 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition flex items-center gap-1.5 font-bold text-xs border border-slate-200 shadow-2xs"
              title="Tra cứu tiến trình giao hàng & Quản lý đơn hàng"
            >
              <PackageCheck className="w-4 h-4 text-teal-600" />
              <span className="hidden md:inline">Tra Cứu & Đơn Hàng</span>
            </Link>


            {/* Shopping Cart Button with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition flex items-center gap-2 font-bold text-xs border border-slate-200 shadow-2xs group"
              title="Xem giỏ hàng của bạn"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Giỏ Hàng</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getRoleDashboardPath(user)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
                  title="Nhấn để vào trang làm việc của bạn"
                >
                  <span className="text-sm">{getRoleBadge(user).icon}</span>
                  <span className="font-black text-emerald-800">{getRoleBadge(user).label}:</span>
                  <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.reload();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-full font-bold transition flex items-center gap-1 border border-rose-200"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirect=/shop"
                  className="text-xs font-bold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </Link>
                <Link
                  href="/register?redirect=/shop"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO COMMERCIAL BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>THIÊN ĐƯỜNG MUA SẮM THÚ CƯNG & VẬT PHẨM CHÍNH HÃNG</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                Đón Thú Cưng Thuần Chủng & Mua Sắm Dinh Dưỡng Trọn Gói
              </h1>
              <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                Nơi bạn tìm thấy các bé cún, bé mèo thuần chủng khỏe mạnh đã tiêm đủ vaccine, cùng toàn bộ thức ăn hạt, pate, bánh thưởng và phụ kiện đồ chơi cao cấp nhất cho thú cưng.
              </p>

              {/* Value propositions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Award className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Thuần Chủng 100%</div>
                    <div className="text-[10px] text-slate-500 font-medium">Kèm sổ tiêm thú y</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Stethoscope className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Bác Sĩ Kiểm Tra</div>
                    <div className="text-[10px] text-slate-500 font-medium">Sức khỏe toàn diện</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Giao Toàn Quốc</div>
                    <div className="text-[10px] text-slate-500 font-medium">Xe chuyên dụng đón bé</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Bảo Hành 30 Ngày</div>
                    <div className="text-[10px] text-slate-500 font-medium">Care & Parvo 1-đổi-1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Spotlight Pet Adoption / Featured Item */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-3xl bg-gradient-to-tr from-amber-400 via-teal-500 to-emerald-600 p-1 shadow-2xl shadow-teal-500/20">
                <div className="bg-white rounded-[22px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                      👑 BÉ YÊU NỔI BẬT
                    </span>
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng về nhà mới
                    </span>
                  </div>

                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-100 group">
                    <img 
                      src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80" 
                      alt="Golden Retriever puppy" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Golden Retriever • 2.5 Tháng tuổi
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">Chó Golden Retriever Thuần Chủng VKA</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Đã tiêm 2 mũi vaccine 7 bệnh, có gắn vi mạch Microchip</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-black text-rose-600">8.500.000 ₫</span>
                      <span className="text-xs text-slate-400 line-through">9.500.000 ₫</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 text-xs text-amber-900 space-y-1 border border-amber-200/60">
                    <div className="font-bold flex items-center gap-1">
                      <span>🎁 Quà tặng đón bé:</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Tặng kèm túi hạt Royal Canin Puppy 4kg + Sổ tiêm chủng thú y + Bảo hành sức khỏe 30 ngày.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const golden = products.find(p => p.sku === 'PET-DOG-GLD-01');
                        if (golden) addToCart(golden);
                      }}
                      className="p-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold border border-slate-200 transition flex items-center justify-center"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const golden = products.find(p => p.sku === 'PET-DOG-GLD-01');
                        if (golden) handleInitiateSinglePurchase(golden);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <PawPrint className="w-4 h-4 text-amber-400" />
                      <span>Đón Bé Về Nhà Ngay (Tư Vấn Miễn Phí)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN STORE CATALOG */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Navigation Filter Bar */}
        <div className="space-y-4">
          {/* Pet Species Tabs (Tất cả / Chó / Mèo) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Dành Cho:</span>
              <button
                onClick={() => setSelectedPet('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPet === 'ALL'
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🐾 Tất Cả Thú Cưng
              </button>
              <button
                onClick={() => setSelectedPet('DOG')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPet === 'DOG'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🐕 Dành Cho Chó
              </button>
              <button
                onClick={() => setSelectedPet('CAT')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPet === 'CAT'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🐈 Dành Cho Mèo
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              >
                <option value="popular">Nổi bật & Bán chạy nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price_asc">Giá từ thấp đến cao</option>
                <option value="price_desc">Giá từ cao đến thấp</option>
                <option value="newest">Hàng mới về</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🐾 Tất Cả Mặt Hàng
            </button>

            <button
              onClick={() => setSelectedCategory('PET')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'PET'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🐶 Thú Cưng Đang Bán (Chó & Mèo Cảnh)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-white font-black">
                {petListings.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('FOOD')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'FOOD'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🍚 Thức Ăn Hạt Khô</span>
            </button>

            <button
              onClick={() => setSelectedCategory('PATE')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'PATE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🥫 Pate & Thức Ăn Ướt</span>
            </button>

            <button
              onClick={() => setSelectedCategory('TOY')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'TOY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🎾 Đồ Chơi Gặm & Vờn</span>
            </button>

            <button
              onClick={() => setSelectedCategory('SNACK')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'SNACK'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🍪 Bánh Thưởng & Súp Thưởng</span>
            </button>

            <button
              onClick={() => setSelectedCategory('SUPPLY')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'SUPPLY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>🏠 Nhà Cây & Phụ Kiện</span>
            </button>

            <button
              onClick={() => setSelectedCategory('HYGIENE')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'HYGIENE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>✨ Cát Vệ Sinh & Sữa Tắm</span>
            </button>
          </div>
        </div>

        {/* 5. PRODUCT & PET DISPLAY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                <div className="h-52 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-6 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vui lòng thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm để xem tất cả sản phẩm.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedPet('ALL');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
            >
              Xem lại tất cả mặt hàng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => {
              const isPet = item.category === 'PET';

              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden relative shadow-xs hover:shadow-xl ${
                    isPet 
                      ? 'border-amber-200 hover:border-amber-400 ring-1 ring-amber-100' 
                      : 'border-slate-200/80 hover:border-teal-300'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      {isPet ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                          🐾 THÚ CƯNG THUẦN CHỦNG
                        </span>
                      ) : (
                        item.badge && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                            {item.badge}
                          </span>
                        )
                      )}
                      {item.discount_percent > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                          -{item.discount_percent}%
                        </span>
                      )}
                    </div>

                    {/* Target Pet Species tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs">
                        {item.target_pet === 'DOG' ? '🐕 Chó' : item.target_pet === 'CAT' ? '🐈 Mèo' : '🐾 Chung'}
                      </span>
                    </div>

                    {/* Quick View Button on Hover */}
                    <button
                      onClick={() => setSelectedItemDetail(item)}
                      className="absolute inset-x-4 bottom-3 py-2 bg-slate-950/85 hover:bg-slate-950 backdrop-blur-md text-white rounded-2xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isPet ? 'Xem hồ sơ sức khỏe bé' : 'Xem chi tiết sản phẩm'}</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                          isPet ? 'bg-amber-50 text-amber-900' : 'bg-teal-50 text-teal-700'
                        }`}>
                          {item.brand}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">{item.unit}</span>
                      </div>

                      <h3 
                        onClick={() => setSelectedItemDetail(item)}
                        className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors"
                      >
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating ? item.rating.toFixed(1) : '5.0'}</span>
                          <span className="text-slate-400 font-normal">({item.review_count || 30})</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${item.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isPet ? (item.stock_quantity > 0 ? `Còn ${item.stock_quantity} bé` : 'Đã có chủ') : (item.stock_quantity > 0 ? `Còn hàng` : 'Hết hàng')}
                        </span>
                      </div>

                      {/* Price & Action Button */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <div className={`text-base font-black tracking-tight ${isPet ? 'text-rose-600 text-lg' : 'text-slate-900'}`}>
                            {formatVND(item.price)}
                          </div>
                          {item.original_price && item.original_price > item.price && (
                            <div className="text-[11px] text-slate-400 line-through">
                              {formatVND(item.original_price)}
                            </div>
                          )}
                        </div>

                        {isPet ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 p-2 rounded-xl text-xs font-bold transition flex items-center justify-center"
                              title="Thêm bé vào giỏ hàng"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiateSinglePurchase(item)}
                              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3 py-2 rounded-xl text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1"
                            >
                              <PawPrint className="w-3.5 h-3.5" />
                              <span>Đón Bé</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                              title="Thêm vào giỏ hàng"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[10px]">Thêm Giỏ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiateSinglePurchase(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1"
                              title="Mua ngay"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Mua Ngay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL 1: PRODUCT & PET DETAILED VIEW */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                {selectedItemDetail.category === 'PET' ? 'Hồ Sơ Thú Cưng Thuần Chủng' : 'Thông Tin Chi Tiết Sản Phẩm'}
              </span>
              <button 
                onClick={() => setSelectedItemDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 h-64 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                <img 
                  src={selectedItemDetail.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80'} 
                  alt={selectedItemDetail.name}
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="sm:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                    {selectedItemDetail.brand}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Quy cách: {selectedItemDetail.unit}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedItemDetail.name}</h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600">{formatVND(selectedItemDetail.price)}</span>
                  {selectedItemDetail.original_price && selectedItemDetail.original_price > selectedItemDetail.price && (
                    <span className="text-sm text-slate-400 line-through">{formatVND(selectedItemDetail.original_price)}</span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{selectedItemDetail.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {selectedItemDetail.ingredients && (
                    <div>
                      <span className="font-bold text-slate-800">
                        {selectedItemDetail.category === 'PET' ? 'Thông tin tiêm chủng & vi mạch: ' : 'Thành phần dinh dưỡng: '}
                      </span>
                      <span className="text-slate-600">{selectedItemDetail.ingredients}</span>
                    </div>
                  )}
                  {selectedItemDetail.usage_instructions && (
                    <div>
                      <span className="font-bold text-slate-800">
                        {selectedItemDetail.category === 'PET' ? 'Chính sách bảo hành & quà tặng: ' : 'Hướng dẫn sử dụng: '}
                      </span>
                      <span className="text-slate-600">{selectedItemDetail.usage_instructions}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(selectedItemDetail);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>Thêm Vào Giỏ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedItemDetail;
                      setSelectedItemDetail(null);
                      handleInitiateSinglePurchase(item);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>{selectedItemDetail.category === 'PET' ? 'Đón Bé Về Nhà' : 'Đặt Mua Ngay'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER & PET ADOPTION CHECKOUT */}
      {orderModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-teal-600 uppercase">
                {orderModalItem.category === 'PET' ? 'Đăng Ký Đón Bé Về Nhà' : 'Xác Nhận Đặt Mua Hàng'}
              </span>
              <button 
                onClick={() => setOrderModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {orderModalItem.category === 'PET' ? 'Đăng Ký Đón Bé Thành Công!' : 'Đặt Mua Hàng Thành Công!'}
                </h4>
                {createdOrderCode && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
                    <span>Mã đơn: #{createdOrderCode}</span>
                  </div>
                )}

                {/* If BANK transfer, show VietQR Payment Box */}
                {paymentMethod === 'BANK' ? (
                  <div className="p-3 bg-gradient-to-b from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                        <QrCode className="w-4 h-4 text-teal-600" />
                        <span>Mã VietQR Thanh Toán Đơn Hàng</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVietQRModalOpen(true)}
                        className="text-[11px] font-bold text-teal-700 underline hover:text-teal-900"
                      >
                        Phóng to QR
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(createdOrderAmount || (orderModalItem.price * orderQuantity))}&addInfo=${encodeURIComponent(createdOrderCode || 'PETCARE')}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`}
                        alt="VietQR"
                        className="w-24 h-24 object-contain rounded-xl border border-teal-200 bg-white p-1 cursor-pointer shrink-0 shadow-xs"
                        onClick={() => setIsVietQRModalOpen(true)}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = BANK_INFO.originalQrImage; }}
                      />
                      <div className="text-xs space-y-0.5 flex-1 min-w-0">
                        <div>
                          <span className="text-slate-500 text-[11px]">Ngân hàng: </span>
                          <span className="font-bold text-slate-800">BIDV (Sông Công)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Chủ TK: </span>
                          <span className="font-bold text-slate-900">{BANK_INFO.accountName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Số TK: </span>
                          <span className="font-mono font-black text-emerald-700">{BANK_INFO.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Số tiền: </span>
                          <span className="font-mono font-black text-rose-600">{formatVND(createdOrderAmount || (orderModalItem.price * orderQuantity))}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500 text-[11px]">Nội dung: </span>
                          <span className="font-mono font-bold text-indigo-700">#{createdOrderCode}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVietQRModalOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem Mã QR Toàn Màn Hình & Sao Chép STK</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    {orderModalItem.category === 'PET' 
                      ? `Cảm ơn bạn đã quan tâm đến bé ${orderModalItem.name}. Bác sĩ thú y của PetCare sẽ gọi điện trực tiếp để tư vấn đón bé và giao bé tận nhà.`
                      : `Đơn hàng ${orderModalItem.name} đã được ghi nhận. Bạn có thể theo dõi tiến trình giao hàng hoặc hủy đơn nếu shop chưa xác nhận!`
                    }
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href="/customer/orders"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Xem Đơn Hàng & Tiến Trình</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalItem(null);
                      setOrderSuccess(false);
                      setCreatedOrderCode(null);
                    }}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Tiếp Tục Mua Sắm
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <img src={orderModalItem.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">{orderModalItem.name}</h5>
                    <div className="text-rose-600 font-black text-sm">{formatVND(orderModalItem.price)}</div>
                    <div className="text-[10px] text-slate-500">{orderModalItem.unit}</div>
                  </div>
                </div>

                {orderModalItem.category !== 'PET' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số lượng mua:</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-base text-slate-900">{orderQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên người nhận: <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ: <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa chỉ giao hàng tận nơi: <span className="text-rose-500">*</span></label>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Phương thức thanh toán */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phương thức thanh toán:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        paymentMethod === 'COD' 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>COD (Khi nhận)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        paymentMethod === 'BANK' 
                          ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Chuyển khoản VietQR</span>
                    </button>
                  </div>
                  {paymentMethod === 'BANK' && (
                    <div className="mt-2 p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Mã QR ngân hàng BIDV ({BANK_INFO.accountNumber}) tự điền đúng số tiền sẽ hiện lên ngay sau khi xác nhận.</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center font-bold text-sm">
                  <span className="text-slate-600">Tổng thanh toán:</span>
                  <span className="text-rose-600 text-base">{formatVND(orderModalItem.price * orderQuantity)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý đơn hàng...</span>
                    </>
                  ) : (
                    <span>{orderModalItem.category === 'PET' ? 'Xác Nhận Đón Bé Về Nhà' : 'Xác Nhận Đặt Mua Hàng'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING CART BUTTON (BOTTOM RIGHT) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 border border-white/20 transition-all hover:scale-105 flex items-center gap-2.5 group"
        title="Xem giỏ hàng"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {cartTotalCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
              {cartTotalCount}
            </span>
          )}
        </div>
        <span className="font-black text-xs hidden md:inline">Giỏ Hàng</span>
        {cartTotalCount > 0 && (
          <span className="hidden lg:inline text-[11px] font-semibold text-emerald-100 border-l border-emerald-400/40 pl-2">
            {formatVND(cartTotalPrice)}
          </span>
        )}
      </button>

      {/* MODAL 3: CART SLIDE-OVER DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-100 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Giỏ Hàng Của Bạn</h3>
                  <p className="text-[11px] text-slate-500">
                    {cartTotalCount > 0 ? `Đang có ${cartTotalCount} sản phẩm trong giỏ` : 'Chưa có sản phẩm nào'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100 text-xs">
              {cartTotalPrice >= 300000 ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>🎉 Chúc mừng! Đơn hàng được MIỄN PHÍ VẬN CHUYỂN toàn quốc.</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-emerald-900">
                    <span>Mua thêm {formatVND(300000 - cartTotalPrice)} để được Freeship:</span>
                    <span>{Math.round((cartTotalPrice / 300000) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (cartTotalPrice / 300000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Giỏ hàng của bạn đang trống</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Hãy lựa chọn các bé thú cưng thuần chủng hoặc thức ăn hạt dinh dưỡng để thêm vào giỏ nhé!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                  >
                    Xem Sản Phẩm Ngay
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 relative group"
                  >
                    <img 
                      src={item.product.image_url} 
                      alt="" 
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200" 
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-bold text-slate-900 text-xs truncate pr-4">
                            {item.product.name}
                          </h5>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-rose-600 font-bold text-xs mt-0.5">
                          {formatVND(item.product.price)}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-1.5 py-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-slate-900">
                          {formatVND(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tạm tính ({cartTotalCount} món):</span>
                    <span className="font-bold text-slate-900">{formatVND(cartTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-600">
                      {cartTotalPrice >= 300000 ? 'MIỄN PHÍ' : '30.000 ₫'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>Tổng thanh toán:</span>
                    <span className="text-rose-600 text-base">
                      {formatVND(cartTotalPrice >= 300000 ? cartTotalPrice : cartTotalPrice + 30000)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    className="py-3 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                    title="Xóa toàn bộ giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleInitiateCartPurchase}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tiến Hành Đặt Mua</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: AUTH REQUIRED TO PURCHASE (BẮT BUỘC ĐĂNG KÝ TÀI KHOẢN ĐỂ MUA) */}
      {isAuthRequiredModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setIsAuthRequiredModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <UserPlus className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                QUY ĐỊNH MUA HÀNG AN TOÀN
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Vui Lòng Đăng Ký Tài Khoản Để Mua Hàng
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Để đảm bảo quyền lợi bảo hành sức khỏe thú cưng, theo dõi hành trình giao hàng và nhận ưu đãi độc quyền, PetCare yêu cầu quý khách có tài khoản thành viên trước khi đặt mua.
              </p>
            </div>

            {/* Benefits checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Bảo hành sức khỏe 30 ngày:</strong> Lưu trữ hồ sơ thú y, vắc-xin và vi mạch chính chủ.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Theo dõi đơn hàng:</strong> Cập nhật trạng thái đóng gói và lộ trình giao hàng trực tiếp.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Ưu đãi thành viên:</strong> Tích điểm hoàn tiền cho các lần khám và mua sắm sau.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  router.push('/register?redirect=/shop');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Đăng Ký Tài Khoản Ngay (Chỉ Mất 30 Giây)</span>
              </button>

              <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                <span>Đã có tài khoản?</span>
                <button
                  onClick={() => {
                    router.push('/login?redirect=/shop');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-black underline underline-offset-2"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CART CHECKOUT MODAL (KHI ĐÃ ĐĂNG NHẬP) */}
      {isCartCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  Xác Nhận Đặt Hàng Giỏ Hàng ({cartTotalCount} món)
                </span>
              </div>
              <button 
                onClick={() => setIsCartCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Đặt Mua Hàng Thành Công!
                </h4>
                {createdOrderCode && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
                    <span>Mã đơn hàng: #{createdOrderCode}</span>
                  </div>
                )}

                {/* If BANK transfer, show VietQR Payment Box */}
                {paymentMethod === 'BANK' ? (
                  <div className="p-3.5 bg-gradient-to-b from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-left space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                        <QrCode className="w-4 h-4 text-teal-600" />
                        <span>Mã VietQR Thanh Toán Đơn Hàng</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVietQRModalOpen(true)}
                        className="text-[11px] font-bold text-teal-700 underline hover:text-teal-900"
                      >
                        Phóng to QR
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(createdOrderAmount || (cartTotalPrice >= 300000 ? cartTotalPrice : cartTotalPrice + 30000))}&addInfo=${encodeURIComponent(createdOrderCode || 'PETCARE')}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`}
                        alt="VietQR"
                        className="w-24 h-24 object-contain rounded-xl border border-teal-200 bg-white p-1 cursor-pointer shrink-0 shadow-xs"
                        onClick={() => setIsVietQRModalOpen(true)}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = BANK_INFO.originalQrImage; }}
                      />
                      <div className="text-xs space-y-0.5 flex-1 min-w-0">
                        <div>
                          <span className="text-slate-500 text-[11px]">Ngân hàng: </span>
                          <span className="font-bold text-slate-800">BIDV (Sông Công)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Chủ TK: </span>
                          <span className="font-bold text-slate-900">{BANK_INFO.accountName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Số TK: </span>
                          <span className="font-mono font-black text-emerald-700">{BANK_INFO.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[11px]">Số tiền: </span>
                          <span className="font-mono font-black text-rose-600">{formatVND(createdOrderAmount || (cartTotalPrice >= 300000 ? cartTotalPrice : cartTotalPrice + 30000))}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500 text-[11px]">Nội dung: </span>
                          <span className="font-mono font-bold text-indigo-700">#{createdOrderCode}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVietQRModalOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem Mã QR Toàn Màn Hình & Sao Chép STK</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Cảm ơn <strong>{customerName || user?.full_name}</strong> đã đặt mua hàng tại PetCare Store!
                    Đơn hàng của bạn đã được ghi nhận vào tài khoản. Bạn có thể theo dõi hành trình bưu kiện hoặc hủy đơn nếu shop chưa xác nhận.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center max-w-xs mx-auto">
                  <Link
                    href="/customer/orders"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Xem Đơn Hàng Của Tôi</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartCheckoutOpen(false);
                      setOrderSuccess(false);
                      setCreatedOrderCode(null);
                    }}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Tiếp Tục
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmCartOrder} className="space-y-4 text-xs">
                {/* Items Summary in Cart */}
                <div className="max-h-40 overflow-y-auto space-y-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img src={item.product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.product.name}</span>
                        <span className="text-slate-400">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatVND(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên người nhận: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Địa chỉ nhận hàng: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phương thức thanh toán:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        paymentMethod === 'COD' 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Thanh toán COD (Khi nhận hàng)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        paymentMethod === 'BANK' 
                          ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Chuyển khoản VietQR (BIDV)</span>
                    </button>
                  </div>
                  {paymentMethod === 'BANK' && (
                    <div className="mt-2 p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Mã QR ngân hàng BIDV ({BANK_INFO.accountNumber}) tự điền đúng số tiền sẽ hiện lên ngay sau khi xác nhận đặt hàng.</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center font-bold text-sm">
                  <span className="text-slate-600">Tổng thanh toán:</span>
                  <span className="text-rose-600 text-base">
                    {formatVND(cartTotalPrice >= 300000 ? cartTotalPrice : cartTotalPrice + 30000)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý đơn hàng...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Xác Nhận Thanh Toán & Đặt Hàng</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. STORE FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <PawPrint className="w-5 h-5 text-teal-400" />
              <span>PetCare SuperStore</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống cung cấp thú cưng thuần chủng và siêu thị vật phẩm dinh dưỡng chăm sóc thú cưng toàn diện chuẩn y khoa.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Danh Mục Mua Sắm</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setSelectedCategory('PET')} className="hover:text-white transition-colors">🐶 Thú Cưng Thuần Chủng (Chó & Mèo)</button></li>
              <li><button onClick={() => setSelectedCategory('FOOD')} className="hover:text-white transition-colors">🍚 Thức Ăn Hạt Khô</button></li>
              <li><button onClick={() => setSelectedCategory('PATE')} className="hover:text-white transition-colors">🥫 Pate & Thức Ăn Ướt</button></li>
              <li><button onClick={() => setSelectedCategory('TOY')} className="hover:text-white transition-colors">🎾 Đồ Chơi Thông Minh</button></li>
              <li><button onClick={() => setSelectedCategory('SNACK')} className="hover:text-white transition-colors">🍪 Bánh Thưởng & Súp Thưởng</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Chính Sách & Cam Kết</h5>
            <ul className="space-y-2">
              <li>Cam kết 100% thú cưng thuần chủng có phả hệ</li>
              <li>Bảo hành sức khỏe 30 ngày (Care & Parvo)</li>
              <li>Miễn phí vận chuyển toàn quốc đơn từ 300K</li>
              <li>Đổi trả phụ kiện trong vòng 7 ngày</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Tư Vấn & Cứu Hộ 24/7</h5>
            <p className="mb-2">Hotline Bác Sĩ Thú Y: <strong className="text-white text-sm">1900 8888</strong></p>
            <p className="text-slate-500 mb-4">Mở cửa từ 8:00 - 22:00 tất cả các ngày trong tuần.</p>
            <Link
              href="/register?redirect=/shop"
              className="inline-block px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors"
            >
              Đăng Ký Thành Viên Nhận Giảm 10%
            </Link>
          </div>
        </div>
      </footer>

      {/* VietQR Payment Modal */}
      <VietQRPaymentModal
        isOpen={isVietQRModalOpen}
        onClose={() => setIsVietQRModalOpen(false)}
        orderCode={createdOrderCode || 'PETCARE'}
        amount={createdOrderAmount}
        customerName={customerName || user?.full_name}
        onPaymentConfirmed={() => {
          setIsVietQRModalOpen(false);
          router.push('/customer/orders');
        }}
      />
    </div>
  );
}
