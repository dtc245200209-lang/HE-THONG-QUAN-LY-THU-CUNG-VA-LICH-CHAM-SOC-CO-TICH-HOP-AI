'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Search, Plus, Filter, RefreshCw, Trash2, Edit3, 
  Eye, CheckCircle2, AlertCircle, ArrowUpRight, ExternalLink, 
  Sparkles, Package, DollarSign, Star, Tag, X, Layers, AlertTriangle,
  PawPrint, ChevronRight
} from 'lucide-react';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, 
  Product, ProductCreate, ProductUpdate 
} from '@/lib/api/products';

// Quick fill realistic sample presets for easy testing
const QUICK_PRESETS: { label: string; icon: string; category: string; data: Partial<ProductCreate> }[] = [
  {
    label: 'Hạt Royal Canin Puppy Maxi (Chó con)',
    icon: '🐕',
    category: 'FOOD',
    data: {
      name: 'Hạt Royal Canin Maxi Puppy Cho Chó Con Cỡ Lớn',
      category: 'FOOD',
      target_pet: 'DOG',
      brand: 'Royal Canin',
      price: 395000,
      original_price: 460000,
      discount_percent: 14,
      unit: 'Túi 4kg',
      stock_quantity: 50,
      rating: 4.9,
      review_count: 145,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Royal_Canin_cat_food.jpg',
      badge: 'BÁN CHẠY',
      description: 'Công thức độc quyền hỗ trợ phát triển xương khớp và hệ tiêu hóa khỏe mạnh cho chó con kích cỡ lớn (26 - 44kg khi trưởng thành) từ 2 đến 15 tháng tuổi.',
      ingredients: 'Thịt gia cầm sấy khô, gạo tấm, bột ngô, đạm thực vật L.I.P, chất béo động vật, củ cải đường sấy, dầu cá giàu EPA-DHA, khoáng chất vi lượng, FOS.',
      usage_instructions: 'Chó 2-4 tháng: 250-320g/ngày. Chó 5-8 tháng: 360-450g/ngày. Chia đều 3 bữa/ngày. Luôn chuẩn bị sẵn nước uống sạch.'
    }
  },
  {
    label: 'Hạt Me-O Cá Hồi & Rau Củ (Mèo)',
    icon: '🐈',
    category: 'FOOD',
    data: {
      name: 'Hạt Me-O Vị Cá Hồi & Rau Củ Hỗ Trợ Đẹp Lông Cho Mèo',
      category: 'FOOD',
      target_pet: 'CAT',
      brand: 'Me-O',
      price: 125000,
      original_price: 145000,
      discount_percent: 14,
      unit: 'Túi 1.2kg',
      stock_quantity: 80,
      rating: 4.8,
      review_count: 210,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Dry_cat_food_04.jpg',
      badge: 'MỚI VỀ',
      description: 'Dinh dưỡng đầy đủ và cân đối cho mèo trưởng thành, bổ sung tinh dầu Omega 3 & 6 từ cá hồi và chất xơ rau củ giúp ngăn ngừa tắc búi lông đường ruột.',
      ingredients: 'Bột cá hồi tươi, ngũ cốc nguyên cám, mỡ gia cầm, bột củ cải đường, tinh chất cà rốt, Taurine, Vitamin C, Vitamin E, khoáng vi lượng.',
      usage_instructions: 'Mèo 2-3kg: 45-60g/ngày. Mèo 3-4kg: 60-80g/ngày. Bảo quản nơi khô ráo, thoáng mát.'
    }
  },
  {
    label: 'Đồ Chơi Bóng Gặm KONG Rubber (Chó)',
    icon: '🎾',
    category: 'TOY',
    data: {
      name: 'Đồ Chơi Bóng Nảy Cao Su Gặm Sạch Răng KONG SqueakAir',
      category: 'TOY',
      target_pet: 'DOG',
      brand: 'KONG',
      price: 185000,
      original_price: 220000,
      discount_percent: 16,
      unit: 'Hộp 2 quả (Size M)',
      stock_quantity: 35,
      rating: 5.0,
      review_count: 178,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Dog_with_red_kong.jpg',
      badge: 'CHÍNH HÃNG',
      description: 'Bóng đồ chơi gặm nảy bất định tích hợp còi kêu bíp bíp kích thích cún vận động chạy nhảy ngoài trời. Bề mặt vải nỉ mềm không mài mòn răng cún như bóng tennis thường.',
      ingredients: '100% Cao su thiên nhiên đàn hồi cao cấp, vải bọc không mài mòn men răng đạt chuẩn kiểm định an toàn vật nuôi Mỹ.',
      usage_instructions: 'Dùng để ném bắt huấn luyện cún phản xạ nhanh. Rửa sạch bằng nước xà phòng ấm sau khi chơi bùn đất.'
    }
  },
  {
    label: 'Cần Câu Chuột Bông Lông Vũ (Mèo)',
    icon: '🪶',
    category: 'TOY',
    data: {
      name: 'Cần Câu Mèo Sợi Thủy Tinh Kèm Chuột Bông & Lông Vũ Chuông',
      category: 'TOY',
      target_pet: 'CAT',
      brand: 'PetCare Joy',
      price: 52000,
      original_price: 70000,
      discount_percent: 26,
      unit: 'Bộ cần (Dài 100cm)',
      stock_quantity: 95,
      rating: 4.8,
      review_count: 190,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Carstian_Luyckx_-_A_kitten_crouched_on_the_left%2C_playing_with_a_feather_toy%2C_grapes%2C_and_peaches.jpg',
      badge: 'GIẢM SÂU',
      description: 'Cần câu đàn hồi siêu dẻo với mồi chuột nhung nhồi cỏ mèo Catnip và chùm lông vũ gắn chuông đồng, kích thích tối đa bản năng vồ bắt của mèo cưng.',
      ingredients: 'Cần sợi thủy tinh chịu lực, chuột bông vải nỉ, cỏ bạc hà mèo Catnip hữu cơ, lông vũ tự nhiên, chuông đồng.',
      usage_instructions: 'Vung nhẹ cần câu lướt trên sàn hoặc trong không trung để mèo rình mồi và bật nhảy 15-20 phút mỗi ngày.'
    }
  },
  {
    label: 'Pate Lon Cá Biển Gravy (Mèo)',
    icon: '🥫',
    category: 'PATE',
    data: {
      name: 'Pate Lon Whiskas Cá Biển Sốt Gravy Đậm Đà Cho Mèo',
      category: 'PATE',
      target_pet: 'CAT',
      brand: 'Whiskas',
      price: 38000,
      original_price: 45000,
      discount_percent: 15,
      unit: 'Lon 400g',
      stock_quantity: 120,
      rating: 4.9,
      review_count: 245,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Canned_Cat_Food1.jpg',
      badge: 'COMBO HOT',
      description: 'Miếng cá biển tươi ngập trong nước sốt gravy thơm lừng, cung cấp độ ẩm dồi dào ngăn ngừa sỏi bàng quang và giúp mèo ăn ngon miệng.',
      ingredients: 'Thịt cá ngừ, cá thu, nước dùng hải sản dashi, dầu đậu nành, Taurine, Vitamin E, chất tạo thạch tự nhiên.',
      usage_instructions: 'Mèo 2-4kg: 1/2 lon/ngày chia 2 bữa. Đậy kín bảo quản tủ lạnh sau khi mở nắp và dùng hết trong 48h.'
    }
  },
  {
    label: 'Xương Da Bò Gặm Sạch Răng (Chó)',
    icon: '🦴',
    category: 'SNACK',
    data: {
      name: 'Xương Gặm Da Bò Tự Nhiên Orgo Sạch Răng Chống Hôi Miệng',
      category: 'SNACK',
      target_pet: 'DOG',
      brand: 'Orgo Bone',
      price: 65000,
      original_price: 80000,
      discount_percent: 19,
      unit: 'Gói 6 thanh (Dài 12cm)',
      stock_quantity: 70,
      rating: 4.8,
      review_count: 110,
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Dog_with_rawhide_chew_toy.jpg',
      badge: 'SẠCH RĂNG',
      description: 'Thanh xương nhai ép từ da bò tự nhiên dẻo dai giúp cọ xát đánh bật mảng bám vôi răng, giải tỏa stress và ngăn ngừa chó cắn phá đồ dùng.',
      ingredients: '100% Da bò nguyên chất sấy nhiệt, chiết xuất diệp lục tố khử mùi, Canxi photphat.',
      usage_instructions: 'Cho cún nhai 1 thanh mỗi ngày sau bữa ăn chính.'
    }
  }
];

// Presets of verified real packshot image URLs
const PHOTO_PRESETS = [
  { name: 'Bao Hạt Royal Canin', url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Royal_Canin_cat_food.jpg' },
  { name: 'Bao Hạt Thú Y Hairball', url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Gastrointestinal_Haiball_cat_dry_food_%28Royal_Canin%29.jpg' },
  { name: 'Bao Hạt Whiskas Thật', url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Whiskas_cat%27s_petfood_with_chicken_dry.jpg' },
  { name: 'Bát Hạt Thức Ăn Chó', url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Dog_food_in_a_bowl.jpg' },
  { name: 'Bát Hạt Thức Ăn Mèo', url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Dry_cat_food_01.jpg' },
  { name: 'Đồ Chơi Gặm KONG Đỏ', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Dog_with_red_kong.jpg' },
  { name: 'Xương Gặm Da Bò Chó', url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Dog_with_rawhide_chew_toy.jpg' },
  { name: 'Bánh Thưởng Khúc Xương', url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/A_Dog_biscuit.jpg' },
  { name: 'Lon Pate Cho Mèo Thật', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Canned_Cat_Food1.jpg' },
  { name: 'Tuýp Súp Thưởng Mèo Liếm', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Cat_offered_a_tube_treat_during_handling_in_Newark%2C_New_Jersey.jpg' },
  { name: 'Cần Câu Lông Vũ Chuông', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Carstian_Luyckx_-_A_kitten_crouched_on_the_left%2C_playing_with_a_feather_toy%2C_grapes%2C_and_peaches.jpg' },
  { name: 'Nhà Cây Cat Tree Mèo', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Cats_Playing_on_Cat_Power_Tower_%288030352554%29.jpg' },
  { name: 'Bát Ăn Chống Sặc Cún', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Dark_Gray_Slow_Feeder_Dog_Bowl_with_Labyrinth_Pattern.jpg' },
  { name: 'Túi Vận Chuyển Du Lịch', url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Close-up_of_Plaid_Pet_Carrier_Bag_with_Flower_Charm.jpg' },
  { name: 'Cát Vệ Sinh Mèo Tự Nhiên', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Fresh_cat_litter.JPG' },
  { name: 'Chai Sữa Tắm Spa Thú Cưng', url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Pet_shampoo_virgin_coconut_oil_Gliricidia_sepium4.jpg' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPet, setSelectedPet] = useState('ALL');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const initialForm: ProductCreate = {
    name: '',
    sku: '',
    category: 'FOOD',
    target_pet: 'DOG',
    brand: 'Royal Canin',
    price: 350000,
    original_price: 400000,
    discount_percent: 12,
    unit: 'Túi 1.5kg',
    stock_quantity: 40,
    rating: 4.9,
    review_count: 50,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Royal_Canin_cat_food.jpg',
    badge: 'MỚI VỀ',
    description: '',
    ingredients: '',
    usage_instructions: '',
    is_active: true,
    is_featured: false
  };

  const [formData, setFormData] = useState<ProductCreate>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        target_pet: selectedPet === 'ALL' ? undefined : selectedPet,
        search: search.trim() || undefined,
        limit: 100,
        sort_by: 'newest'
      });
      setProducts(res.items);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      showToast('Không thể tải dữ liệu từ database: ' + (err.message || 'Lỗi kết nối'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedPet, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const foodCount = products.filter(p => p.category === 'FOOD').length;
    const toyCount = products.filter(p => p.category === 'TOY').length;
    const snackPateCount = products.filter(p => p.category === 'PATE' || p.category === 'SNACK').length;
    const totalStock = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
    const totalValue = products.reduce((acc, p) => acc + (p.price * (p.stock_quantity || 0)), 0);
    return { total, foodCount, toyCount, snackPateCount, totalStock, totalValue };
  }, [products]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Preset Auto-fill
  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      ...preset.data,
      name: preset.data.name || prev.name,
      category: preset.data.category || prev.category,
      target_pet: preset.data.target_pet || prev.target_pet,
      brand: preset.data.brand || prev.brand,
      price: preset.data.price || prev.price,
      original_price: preset.data.original_price || prev.original_price,
      unit: preset.data.unit || prev.unit,
      stock_quantity: preset.data.stock_quantity || prev.stock_quantity,
      image_url: preset.data.image_url || prev.image_url,
      description: preset.data.description || prev.description,
      ingredients: preset.data.ingredients || prev.ingredients,
      usage_instructions: preset.data.usage_instructions || prev.usage_instructions,
      badge: preset.data.badge || prev.badge,
    }));
    showToast(`Đã tự động điền mẫu: "${preset.label}"! Bạn có thể chỉnh sửa trước khi lưu.`);
  };

  // Submit Create Product
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createProduct(formData);
      showToast(`Đã thêm thành công sản phẩm "${created.name}" vào cơ sở dữ liệu PostgreSQL!`);
      setShowAddModal(false);
      setFormData(initialForm);
      await loadProducts();
    } catch (err: any) {
      console.error('Create product error:', err);
      showToast('Lỗi khi lưu sản phẩm vào database: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update Product
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const updated = await updateProduct(selectedProduct.id, {
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: Number(selectedProduct.price),
        original_price: Number(selectedProduct.original_price),
        stock_quantity: Number(selectedProduct.stock_quantity),
        badge: selectedProduct.badge,
        category: selectedProduct.category,
        target_pet: selectedProduct.target_pet,
        unit: selectedProduct.unit,
        image_url: selectedProduct.image_url,
        description: selectedProduct.description,
        ingredients: selectedProduct.ingredients,
        usage_instructions: selectedProduct.usage_instructions,
        is_active: selectedProduct.is_active,
        is_featured: selectedProduct.is_featured
      });
      showToast(`Đã cập nhật sản phẩm "${updated.name}" thành công!`);
      setShowEditModal(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err: any) {
      console.error('Update error:', err);
      showToast('Lỗi khi cập nhật sản phẩm: ' + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      await deleteProduct(id);
      showToast(`Đã xóa sản phẩm "${name}" khỏi database PostgreSQL!`);
      setDeleteConfirmId(null);
      await loadProducts();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Lỗi khi xóa sản phẩm: ' + (err.response?.data?.detail || err.message), 'error');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'FOOD': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">🍚 Đồ Ăn Hạt</span>;
      case 'PATE': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">🥫 Pate Ướt</span>;
      case 'SNACK': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">🍪 Bánh Thưởng</span>;
      case 'TOY': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800">🎾 Đồ Chơi</span>;
      case 'SUPPLY': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">🏠 Phụ Kiện</span>;
      case 'HYGIENE': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">✨ Vệ Sinh</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">{cat}</span>;
    }
  };

  const getPetBadge = (pet: string) => {
    switch (pet) {
      case 'DOG': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">🐕 Chó</span>;
      case 'CAT': return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700">🐈 Mèo</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">🐾 Cả Hai</span>;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30' 
            : 'bg-rose-900 text-rose-200 border border-rose-500/30'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>PostgreSQL Database Engine • Trực Tiếp Thời Gian Thực</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Quản Lý Sản Phẩm & Database Cửa Hàng Pet Shop
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem toàn bộ dữ liệu trong bảng <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-teal-700">products</code>, thêm loại hạt mới, đồ chơi mới hoặc chỉnh sửa dữ liệu thực tế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-teal-600" />
            <span>Xem Ngoài Cửa Hàng Public</span>
          </Link>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            title="Làm mới dữ liệu từ Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            <span>Đồng Bộ DB</span>
          </button>

          <button
            onClick={() => {
              setFormData(initialForm);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Sản Phẩm Mới Vào Database</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Sản Phẩm DB</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Đang lưu trong PostgreSQL</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thức Ăn Hạt (FOOD)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.foodCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Hạt khô dinh dưỡng</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đồ Chơi Thú Cưng</div>
          <div className="text-2xl font-black text-cyan-600 mt-1">{stats.toyCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Bóng gặm, cần câu, vờn</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pate & Bánh Thưởng</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.snackPateCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Thức ăn ướt & súp thưởng</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Tồn Kho</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.totalStock.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Đơn vị sản phẩm</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá Trị Kho Hàng</div>
          <div className="text-lg font-black text-emerald-700 mt-1 truncate">{formatVND(stats.totalValue)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Ước tính theo giá bán</div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, mã SKU, thương hiệu (Royal Canin, KONG, Me-O...)"
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Tất Cả Danh Mục ({stats.total})</option>
            <option value="FOOD">🍚 Đồ Ăn Hạt ({stats.foodCount})</option>
            <option value="TOY">🎾 Đồ Chơi Thông Minh ({stats.toyCount})</option>
            <option value="PATE">🥫 Pate & Thức Ăn Ướt</option>
            <option value="SNACK">🍪 Bánh Thưởng & Snack</option>
            <option value="SUPPLY">🏠 Vật Phẩm & Phụ Kiện</option>
            <option value="HYGIENE">✨ Vệ Sinh & Spa</option>
          </select>

          {/* Pet Species Filter */}
          <select
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Tất Cả Loài (Chó & Mèo)</option>
            <option value="DOG">🐕 Dành Cho Chó</option>
            <option value="CAT">🐈 Dành Cho Mèo</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Hiển thị <span className="font-bold text-slate-800">{products.length}</span> bản ghi từ PostgreSQL
        </div>
      </div>

      {/* LIVE POSTGRESQL TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Ảnh Thật</th>
                <th className="py-3 px-4">Tên Sản Phẩm & SKU</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4">Loài</th>
                <th className="py-3 px-4">Thương Hiệu</th>
                <th className="py-3 px-4">Giá Bán</th>
                <th className="py-3 px-4">Tồn Kho</th>
                <th className="py-3 px-4">Đánh Giá</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                      <span>Đang nạp dữ liệu từ PostgreSQL Database...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-500">
                    <div className="space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold">Không tìm thấy sản phẩm nào trong database.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-teal-600 font-bold hover:underline"
                      >
                        + Thêm sản phẩm hạt hoặc đồ chơi đầu tiên ngay
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                        <img 
                          src={p.image_url || 'https://upload.wikimedia.org/wikipedia/commons/8/85/Royal_Canin_cat_food.jpg'} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300" 
                        />
                      </div>
                    </td>

                    {/* Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 max-w-xs line-clamp-1 hover:text-teal-600 transition-colors cursor-pointer" onClick={() => setQuickViewProduct(p)}>
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">{p.sku}</span>
                        {p.badge && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      {getCategoryBadge(p.category)}
                    </td>

                    {/* Target Pet */}
                    <td className="py-3 px-4">
                      {getPetBadge(p.target_pet)}
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {p.brand}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900">{formatVND(p.price)}</div>
                      {p.original_price && p.original_price > p.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatVND(p.original_price)} (-{p.discount_percent}%)
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {p.stock_quantity} <span className="font-normal text-slate-500 text-[11px]">{p.unit}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${p.stock_quantity > 10 ? 'text-emerald-600' : p.stock_quantity > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {p.stock_quantity > 10 ? 'Sẵn Hàng' : p.stock_quantity > 0 ? 'Sắp Hết' : 'Hết Hàng'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">({p.review_count} vote)</span>
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        {p.is_active ? 'Đang Bán' : 'Tạm Ẩn'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQuickViewProduct(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Xóa khỏi Database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW PRODUCT (+ Quick Presets for Food & Toys) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Tạo Bản Ghi PostgreSQL Mới</span>
                <h3 className="text-xl font-black text-slate-900">Thêm Loại Hạt, Đồ Chơi Hoặc Phụ Kiện Vào Database</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Điền nhanh sản phẩm thực tế mẫu (1-Click):
                </span>
                <span className="text-[10px] text-teal-700 font-medium">Bấm để tự điền ảnh & thông số thật</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-teal-600 hover:text-white text-slate-700 text-xs font-bold border border-teal-200/60 shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Sản Phẩm Thật <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Hạt Royal Canin Mini Adult Cho Chó Nhỏ, Bóng Gặm KONG Đỏ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục Sản Phẩm</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="FOOD">🍚 Đồ Ăn Hạt Khô (FOOD)</option>
                    <option value="TOY">🎾 Đồ Chơi Thông Minh (TOY)</option>
                    <option value="PATE">🥫 Pate & Thức Ăn Ướt (PATE)</option>
                    <option value="SNACK">🍪 Bánh Thưởng & Snack (SNACK)</option>
                    <option value="SUPPLY">🏠 Vật Phẩm & Phụ Kiện (SUPPLY)</option>
                    <option value="HYGIENE">✨ Vệ Sinh & Spa (HYGIENE)</option>
                  </select>
                </div>

                {/* Target Pet */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dành Cho Loài Cưng</label>
                  <select
                    value={formData.target_pet}
                    onChange={(e) => setFormData({ ...formData, target_pet: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="DOG">🐕 Dành Cho Chó (DOG)</option>
                    <option value="CAT">🐈 Dành Cho Mèo (CAT)</option>
                    <option value="ALL">🐾 Cả Chó Và Mèo (ALL)</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thương Hiệu / Hãng</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Royal Canin, KONG, Orijen, Whiskas, Me-O..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quy Cách / Đơn Vị</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Túi 1.5kg, Bao 4kg, Quả, Cái, Hộp 12 gói..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Bán Niêm Yết (VNĐ) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-emerald-700"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Gốc Trước Giảm (VNĐ)</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={formData.original_price || formData.price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>

                {/* Badge */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Huy Hiệu Nổi Bật</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="MỚI VỀ, BÁN CHẠY, CHUẨN THÚ Y..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Image URL with Presets Selector */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">Link Ảnh Thực Tế Ngoài Đời (Packshot URL)</label>
                    <span className="text-[10px] text-slate-400">Có thể dán link ảnh tùy chọn</span>
                  </div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-[11px]"
                  />
                  {/* Photo picker chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold self-center">Chọn nhanh ảnh thật:</span>
                    {PHOTO_PRESETS.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: photo.url })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          formData.image_url === photo.url
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {photo.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Mô Tả Sản Phẩm & Công Dụng</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả công dụng, tính năng, đặc điểm nổi bật..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Ingredients */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Thành Phần Dinh Dưỡng / Chất Liệu</label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="Thịt gà tươi sấy, đạm L.I.P, Canxi, Omega 3 & 6, cao su thiên nhiên..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Usage instructions */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hướng Dẫn Cho Ăn / Sử Dụng</label>
                  <input
                    type="text"
                    value={formData.usage_instructions}
                    onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                    placeholder="Liều lượng khẩu phần ăn hàng ngày theo thể trọng..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-md shadow-teal-500/20 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>💾 Lưu Trực Tiếp Vào Database PostgreSQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRODUCT */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">Cập Nhật Database</span>
                <h3 className="text-lg font-black text-slate-900">Chỉnh Sửa Thông Tin Sản Phẩm</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Sản Phẩm</label>
                <input
                  type="text"
                  required
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Bán (VNĐ)</label>
                  <input
                    type="number"
                    required
                    step={1000}
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Gốc (VNĐ)</label>
                  <input
                    type="number"
                    step={1000}
                    value={selectedProduct.original_price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    min={0}
                    value={selectedProduct.stock_quantity}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Huy Hiệu</label>
                  <input
                    type="text"
                    value={selectedProduct.badge || ''}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Ảnh Thực Tế</label>
                <input
                  type="url"
                  value={selectedProduct.image_url}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProduct.is_active}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, is_active: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>Đang mở bán trên shop (is_active)</span>
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProduct.is_featured}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, is_featured: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>Sản phẩm nổi bật</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK VIEW DETAILS */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-teal-600 uppercase">Chi Tiết Bản Ghi Trong DB</span>
              <button onClick={() => setQuickViewProduct(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <img 
                src={quickViewProduct.image_url} 
                alt={quickViewProduct.name} 
                className="w-24 h-24 object-cover rounded-2xl border border-slate-200"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{quickViewProduct.name}</h4>
                <div className="text-emerald-700 font-black text-base">{formatVND(quickViewProduct.price)}</div>
                <div className="text-xs text-slate-500">Mã SKU: <span className="font-mono font-bold text-slate-700">{quickViewProduct.sku}</span></div>
                <div className="text-xs text-slate-500">UUID DB: <span className="font-mono text-[10px] text-slate-400">{quickViewProduct.id}</span></div>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-700">Mô tả: </span>
                <span className="text-slate-600">{quickViewProduct.description || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Thành phần: </span>
                <span className="text-slate-600">{quickViewProduct.ingredients || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Hướng dẫn sử dụng: </span>
                <span className="text-slate-600">{quickViewProduct.usage_instructions || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setQuickViewProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-base">Xác Nhận Xóa Khỏi Database?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Bản ghi sản phẩm sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu PostgreSQL. Bạn có chắc chắn không?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  const target = products.find(p => p.id === deleteConfirmId);
                  if (target) handleDeleteProduct(target.id, target.name);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
