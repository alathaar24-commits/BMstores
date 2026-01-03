import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Home, Heart, FileText, User, ShoppingCart, Search, 
  ArrowLeft, ArrowRight, ShoppingBag, Shirt, Smartphone, 
  Armchair, Baby, Sparkles, Truck, ShieldCheck, 
  ClipboardList, Package, Settings, Minus, Plus, Filter, 
  FileEdit, Camera, X, ChevronRight, LogOut, Lock, 
  Phone, Shield, MapPin, CheckCircle, Trash2, PlusCircle, 
  Edit, Save, Grid, Tag, BarChart3, TrendingUp, AlertTriangle, Moon, Sun,
  LayoutDashboard, Activity, Layers, Image as ImageIcon, Loader2, UploadCloud, KeyRound,
  CreditCard, Banknote, Wallet, Copy, ExternalLink, Eye, EyeOff, List, DollarSign, Clock
} from 'lucide-react';

/**
 * ==========================================
 * KONFIGURASI SUPABASE
 * ==========================================
 */
const supabaseUrl = 'https://dbchtwizxhojdheykjrm.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY2h0d2l6eGhvamRoZXlranJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkxOTAsImV4cCI6MjA4MTYyNTE5MH0.S9PTlZ8V6oGIAnTUkeM7_gWrfQ9-p45-HrXpSMUEMYQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- HELPER FUNCTIONS ---
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
}

function areVariantsEqual(v1, v2) {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;
  const keys1 = Object.keys(v1);
  const keys2 = Object.keys(v2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => v1[key] === v2[key]);
}

function formatVariantString(variants) {
  if (!variants || typeof variants !== 'object' || Object.keys(variants).length === 0) return '';
  return `(${Object.values(variants).join(', ')})`;
}

// ==========================================
// FUNGSI FIX FORMAT NOMOR WHATSAPP
// ==========================================
function formatPhoneForWhatsApp(phone) {
  if (!phone) return '';
  
  // Hilangkan semua karakter non-digit
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Jika nomor dimulai dengan 0, ganti dengan 62
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  
  // Jika nomor dimulai dengan 62, biarkan
  // Jika nomor dimulai dengan +62, sudah dihilangkan oleh replace
  // Pastikan panjang minimal
  if (cleanPhone.length < 10) return '';
  
  return cleanPhone;
}

// --- DATA MAPPERS ---
const mapProductFromDB = (p) => {
  if (!p) return null;

  let parsedVariants = [];
  let parsedVariantImages = {};
  let parsedImages = [];
  let parsedVariantPrices = {};

  // Parse Variants
  if (p.variants) {
    if (Array.isArray(p.variants)) parsedVariants = p.variants;
    else if (typeof p.variants === 'string') {
      try { parsedVariants = JSON.parse(p.variants); } catch (e) { parsedVariants = []; }
    } else if (typeof p.variants === 'object') {
      parsedVariants = Object.values(p.variants); 
    }
  }

  // Parse Variant Images
  if (p.variant_images) {
    if (typeof p.variant_images === 'object' && p.variant_images !== null) {
      parsedVariantImages = p.variant_images;
    } else if (typeof p.variant_images === 'string') {
      try { parsedVariantImages = JSON.parse(p.variant_images); } catch (e) { parsedVariantImages = {}; }
    }
  }

  // Parse Variant Prices
  if (p.variant_prices) {
    if (typeof p.variant_prices === 'object' && p.variant_prices !== null) {
      parsedVariantPrices = p.variant_prices;
    } else if (typeof p.variant_prices === 'string') {
      try { parsedVariantPrices = JSON.parse(p.variant_prices); } catch { parsedVariantPrices = {}; }
    }
  }

  // Parse Gallery Images
  if (p.images) {
      if (Array.isArray(p.images)) parsedImages = p.images;
      else if (typeof p.images === 'string') {
          try { parsedImages = JSON.parse(p.images); } catch { parsedImages = []; }
      }
  }

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description || p.desc,
    img: p.img || 'https://placehold.co/400x400?text=No+Image',
    images: parsedImages,
    variants: Array.isArray(parsedVariants) ? parsedVariants : [], 
    variantImages: parsedVariantImages,
    variantPrices: parsedVariantPrices
  };
};

const mapProductToDB = (p) => {
  return {
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category,
    description: p.description || p.desc,
    img: p.img || 'https://placehold.co/400x400?text=No+Image',
    images: p.images || [],
    variants: p.variants || [], 
    variant_images: p.variantImages || {},
    variant_prices: p.variantPrices || {}
  };
};

const mapSettingsFromDB = (s) => ({
  storeName: s.store_name,
  whatsapp: s.whatsapp,
  address: s.address,
  heroImage: s.hero_image,
  promoText: s.promo_text,
  categories: s.categories || [],
  theme: s.theme,
  currency: s.currency,
  paymentMethods: s.payment_methods || ['COD', 'Ambil di Kantor'],
  bankAccounts: s.bank_accounts || []
});

const mapSettingsToDB = (s) => ({
  store_name: s.storeName,
  whatsapp: s.whatsapp,
  address: s.address,
  hero_image: s.heroImage,
  promo_text: s.promoText,
  categories: s.categories,
  theme: s.theme,
  currency: s.currency,
  payment_methods: s.paymentMethods,
  bank_accounts: s.bankAccounts
});

const mapOrderFromDB = (o) => {
  let parsedItems = [];
  
  if (o.items) {
    if (Array.isArray(o.items)) {
      parsedItems = o.items;
    } else if (typeof o.items === 'string') {
      try {
        parsedItems = JSON.parse(o.items);
      } catch (e) {
        console.warn("Failed to parse order items:", e);
        parsedItems = [];
      }
    }
  }

  return {
    ...o,
    items: Array.isArray(parsedItems) ? parsedItems : []
  };
};

/**
 * ==========================================
 * INITIAL STATE (FALLBACK)
 * ==========================================
 */
const INITIAL_DB = {
  settings: {
    storeName: "BM Store Official",
    whatsapp: "6281234567890",
    address: "Jl. Sudirman No. 1, Jakarta Pusat",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    promoText: "Diskon Spesial Hari Ini 50%",
    categories: ["Fesyen", "Elektronik", "Rumah", "Kecantikan", "Olahraga"],
    theme: 'light', 
    currency: 'IDR',
    paymentMethods: ['COD', 'Ambil di Kantor'],
    bankAccounts: [
      { bank: 'BCA', number: '1234567890', name: 'Budi Santoso' },
      { bank: 'Mandiri', number: '0987654321', name: 'Budi Santoso' }
    ]
  },
  products: [],
  orders: [],
  user: {
    name: "",
    email: "",
    phone: "",
    address: "",
    subdistrict: "",
    village: "",
    full_address: "",
    avatar_url: ""
  }
};

/**
 * ==========================================
 * SHARED COMPONENTS
 * ==========================================
 */
const ToastNotification = ({ toast }) => (
  <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md border border-white/10">
      {toast.type === 'success' ? <CheckCircle size={16} className="text-green-400 dark:text-green-600" /> : <AlertTriangle size={16} className="text-red-400 dark:text-red-600" />}
      <span className="text-xs font-bold tracking-wide">{toast.msg}</span>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-primary">
    <Loader2 size={40} className="animate-spin mb-4"/>
    <p className="font-bold text-slate-500 text-xs tracking-wider">MEMUAT TOKO...</p>
  </div>
);

const Header = ({ title, showCart = true, backTo, cartCount, navigate }) => (
  <div className="sticky top-0 z-50 flex items-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg p-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
    {backTo ? (
      <button onClick={() => navigate(backTo)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
        <ArrowLeft size={20} className="text-slate-800 dark:text-white group-active:-translate-x-1 transition-transform"/>
      </button>
    ) : (
      <div className="w-10"></div>
    )}
    <h2 className="flex-1 text-center font-bold text-lg text-slate-900 dark:text-white tracking-tight">{title}</h2>
    <div className="w-10 flex justify-end">
      {showCart && (
        <button onClick={() => navigate('cart')} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ShoppingCart size={20} className="text-slate-800 dark:text-white"/>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">{cartCount}</span>
          )}
        </button>
      )}
    </div>
  </div>
);

const BottomNav = ({ role, currentView, navigate }) => {
  const isAdminNav = role === 'admin';
  const menu = isAdminNav ? [
    { id: 'admin-orders', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'admin-inventory', icon: Package, label: 'Produk' },
    { id: 'admin-settings', icon: Settings, label: 'Pengaturan' }
  ] : [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'saved', icon: Heart, label: 'Disimpan' },
    { id: 'orders', icon: FileText, label: 'Pesanan' },
    { id: 'profile', icon: User, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors duration-300">
      <div className="max-w-md mx-auto flex justify-around py-3">
        {menu.map((item) => (
          <button 
            key={item.id} 
            onClick={() => navigate(item.id)} 
            className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-95 ${currentView === item.id ? 'text-primary' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}
          >
            <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} className={currentView === item.id ? 'animate-in fade-in zoom-in duration-200' : ''} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- KOMPONEN FORM ALAMAT (DIPERBAIKI KONTRAST) ---
const AddressForm = ({ formData, onChange, isInEditProfile = false }) => {
  return (
    <div className={`space-y-3 ${isInEditProfile ? 'p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700' : ''}`}>
      <div>
        <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">Kabupaten/Kota *</label>
        <input 
          value={formData.subdistrict || ''} 
          onChange={(e) => onChange({...formData, subdistrict: e.target.value})}
          className={`w-full ${isInEditProfile ? 'bg-white dark:bg-gray-900 border-2' : 'bg-slate-50 dark:bg-slate-900'} border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`} 
          placeholder="Contoh: Jakarta Selatan"
          required
        />
      </div>
      <div>
        <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">Kecamatan *</label>
        <input 
          value={formData.village || ''} 
          onChange={(e) => onChange({...formData, village: e.target.value})}
          className={`w-full ${isInEditProfile ? 'bg-white dark:bg-gray-900 border-2' : 'bg-slate-50 dark:bg-slate-900'} border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`} 
          placeholder="Contoh: Kebayoran Baru"
          required
        />
      </div>
      <div>
        <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">Desa/Kelurahan *</label>
        <input 
          value={formData.address || ''} 
          onChange={(e) => onChange({...formData, address: e.target.value})}
          className={`w-full ${isInEditProfile ? 'bg-white dark:bg-gray-900 border-2' : 'bg-slate-50 dark:bg-slate-900'} border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`} 
          placeholder="Contoh: Gandaria Utara"
          required
        />
      </div>
      <div>
        <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">Detail Alamat (Opsional)</label>
        <textarea 
          value={formData.full_address || ''} 
          onChange={(e) => onChange({...formData, full_address: e.target.value})}
          className={`w-full ${isInEditProfile ? 'bg-white dark:bg-gray-900 border-2' : 'bg-slate-50 dark:bg-slate-900'} border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none`} 
          placeholder="Contoh: Jl. Melati No. 10, RT 05/RW 02"
          rows="3"
        ></textarea>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT DETAIL PESANAN
// ==========================================
const OrderDetailView = ({ order, navigate, settings, userProfile, onCancelOrder }) => {
  const whatsappNumber = formatPhoneForWhatsApp(settings?.whatsapp || '')
  
  const handleContactAdmin = () => {
    const message = `Halo admin, saya ingin bertanya tentang pesanan #${order.id} - ${order.customer}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCancelOrder = () => {
    if (window.confirm(`Apakah Anda yakin ingin membatalkan pesanan #${order.id}?`)) {
      onCancelOrder(order.id);
    }
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <Header title="Detail Pesanan" showCart={false} backTo="orders" navigate={navigate} />
      
      <div className="p-5 space-y-5">
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg dark:text-white">Pesanan #{order.id}</h3>
              <p className="text-sm text-slate-500">{order.date}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              order.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
              order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              order.status === 'Dikemas' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              order.status === 'Dibatalkan' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {order.status}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">Metode Pembayaran</span>
              <span className="font-bold dark:text-white">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">Total Pembayaran</span>
              <span className="font-bold text-lg text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Informasi Pengiriman */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2"><MapPin size={18} className="text-primary"/> Alamat Pengiriman</h3>
          <div className="space-y-2">
            <p className="text-sm dark:text-white font-medium">{order.customer}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{order.phone}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {order.subdistrict && <span>{order.subdistrict}, </span>}
              {order.village && <span>{order.village}, </span>}
              {order.address && <span>{order.address}</span>}
              {order.full_address && <span><br/>{order.full_address}</span>}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2"><ShoppingBag size={18} className="text-primary"/> Items Pesanan</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img src={item.img} className="w-16 h-16 rounded-lg object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
                <div className="flex-1">
                  <h4 className="font-bold text-sm dark:text-white">{item.name}</h4>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <p className="text-xs text-slate-500">{formatVariantString(item.variants)}</p>
                  )}
                  <div className="flex justify-between mt-1">
                    <span className="text-sm font-bold text-primary">{formatRupiah(item.finalPrice || item.price)}</span>
                    <span className="text-sm text-slate-500">x{item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'Menunggu' && (
            <button 
              onClick={handleCancelOrder}
              className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Batalkan Pesanan
            </button>
          )}
          
          <button 
            onClick={handleContactAdmin}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            Hubungi Admin
          </button>
          
          <button 
          onClick={() => navigate('orders')} // Ini akan memanggil fungsi yang sudah dimodifikasi
          className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Kembali ke Daftar Pesanan
        </button>
        </div>
      </div>
    </div>
  );
};

// --- VIEW COMPONENTS (CUSTOMER) ---

const HomeView = ({ settings, products, cartCount, navigate, addToCart }) => {
  const [activeCat, setActiveCat] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filtered = activeCat === 'Semua' 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : products.filter(p => p.category === activeCat && 
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.category.toLowerCase().includes(searchTerm.toLowerCase())));

  const scrollToProducts = () => {
    const section = document.getElementById('products-grid');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 py-3 flex justify-between border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-primary tracking-tight">{settings.storeName}</h1>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Official Store</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('admin-login')} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <ShieldCheck size={20}/>
          </button>
          <button onClick={() => navigate('cart')} className="relative p-2 text-slate-800 dark:text-white hover:text-primary transition-colors">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
          <Search size={18} className="text-slate-400 mr-3"/>
          <input 
            placeholder="Cari produk impianmu..." 
            className="bg-transparent w-full outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={16}/>
            </button>
          )}
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden aspect-[21/9] shadow-lg group cursor-pointer ring-1 ring-black/5 dark:ring-white/10">
          <img src={settings.heroImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => e.target.src = INITIAL_DB.settings.heroImage} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center items-start">
            <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white mb-2 border border-white/20">LIMITED OFFER</span>
            <h2 className="text-2xl font-bold text-white mb-4 w-3/4 leading-tight">{settings.promoText}</h2>
            <button 
              onClick={scrollToProducts}
              className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors shadow-lg shadow-primary/30"
            >
              Belanja <ArrowRight size={14}/>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Kategori</h3>
            <span 
              onClick={() => setActiveCat('Semua')}
              className="text-xs font-bold text-primary cursor-pointer hover:underline"
            >
              Lihat Semua
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveCat('Semua')} 
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${activeCat === 'Semua' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              Semua
            </button>
            {settings.categories?.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCat(cat)} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${activeCat === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        <div id="products-grid" className="grid grid-cols-2 gap-4">
          {filtered.length === 0 ? <p className="col-span-2 text-center text-slate-500 py-10">Tidak ada produk.</p> : 
           filtered.map(item => (
            <div key={item.id} onClick={() => navigate('product', item)} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group active:scale-[0.98] transition-all duration-300 hover:shadow-md cursor-pointer">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
                {item.stock < 10 && item.stock > 0 && <span className="absolute top-2 left-2 bg-red-500/90 backdrop-blur text-white text-[9px] px-2 py-1 rounded-full font-bold shadow-sm">Sisa {item.stock}</span>}
                {item.stock === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white text-sm">Habis</div>}
                
                {item.images && item.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                    <ImageIcon size={10} /> {item.images.length}
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">{item.category}</div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">{formatRupiah(item.price)}</span>
                  <div className="w-8 h-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav role="customer" currentView="home" navigate={navigate} />
    </div>
  );
};

const ProductDetailView = ({ product, addToCart, navigate, cartCount, saved, toggleSaved }) => {
  const [selectedVariants, setSelectedVariants] = useState({});
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [finalPrice, setFinalPrice] = useState(0);

  // Initialize
  useEffect(() => {
    if (product) {
      const defaultImage = product.img || "https://placehold.co/400x400?text=No+Image";
      setActiveImage(defaultImage);
      setFinalPrice(product.price || 0);
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        const initial = {};
        product.variants.forEach(v => {
          if (v.name && v.options && v.options.length > 0) {
            initial[v.name] = v.options[0];
          }
        });
        setSelectedVariants(initial);
      }
    }
  }, [product]);

  // Calculate final price based on variants
  useEffect(() => {
    if (product && product.variantPrices) {
      let calculatedPrice = product.price || 0;
      
      Object.entries(selectedVariants).forEach(([variantName, option]) => {
        const variantKey = `${variantName}:${option}`;
        if (product.variantPrices[variantKey]) {
          calculatedPrice += product.variantPrices[variantKey];
        }
      });
      
      setFinalPrice(calculatedPrice);
    }
  }, [selectedVariants, product]);

  // Trigger: Change Image based on Variant
  useEffect(() => {
    if (product && product.variantImages && selectedVariants) {
      const selectedOptions = Object.values(selectedVariants);
      const matchedOption = selectedOptions.find(opt => product.variantImages[opt]);
      
      if (matchedOption) {
        setActiveImage(product.variantImages[matchedOption]);
      } else if (product.img) {
        setActiveImage(product.img);
      }
    }
  }, [selectedVariants, product]);

  if (!product) return null;
  const isSaved = saved.some(i => i.id === product.id);

  const handleVariantChange = (type, value) => {
    setSelectedVariants(prev => ({...prev, [type]: value}));
  };

  const handleAddToCart = () => {
    if(product.stock > 0) {
      addToCart(product, selectedVariants, qty, finalPrice);
    }
  };

  const handleBuyNow = () => {
    if(product.stock > 0) {
      addToCart(product, selectedVariants, qty, finalPrice);
      navigate('checkout');
    }
  };

  // Combine main image + gallery images for the slider
  const allImages = product.img ? [product.img, ...(product.images || [])].filter((v, i, a) => a.indexOf(v) === i) : [];

  return (
    <div className="bg-background-light dark:bg-slate-950 min-h-screen pb-32 max-w-md mx-auto animate-in slide-in-from-right duration-300">
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-50 flex items-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg p-4 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          <ArrowLeft size={20} className="text-slate-800 dark:text-white group-active:-translate-x-1 transition-transform"/>
        </button>
        <h2 className="flex-1 text-center font-bold text-lg text-slate-900 dark:text-white tracking-tight">Detail Produk</h2>
        <div className="w-10 flex justify-end">
          <button onClick={() => navigate('cart')} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ShoppingCart size={20} className="text-slate-800 dark:text-white"/>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Image */}
      <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 relative group">
        {activeImage ? (
          <img src={activeImage} className="w-full h-full object-cover transition-opacity duration-300" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon size={48} />
          </div>
        )}
        {product.stock === 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-xl">Stok Habis</div>}
      </div>

      {/* Gallery Thumbs */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 py-3 no-scrollbar -mt-12 relative z-10">
          {allImages.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(img)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img ? 'border-primary shadow-lg scale-105' : 'border-white dark:border-slate-700 opacity-70'}`}
            >
              <img src={img} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
            </button>
          ))}
        </div>
      )}

      <div className="p-5 space-y-5 relative bg-background-light dark:bg-slate-950 rounded-t-3xl border-t border-slate-100 dark:border-slate-800 -mt-4 z-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded">{product.category}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>Stok: {product.stock}</span>
            </div>
          </div>
          <button onClick={() => toggleSaved(product)} 
            className={`p-3 rounded-full shadow-sm border transition-all active:scale-90 ${isSaved ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}>
            <Heart size={20} className={isSaved ? 'fill-current' : ''}/>
          </button>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">{formatRupiah(finalPrice)}</h2>
          {finalPrice !== product.price && (
            <p className="text-sm text-slate-400 line-through">{formatRupiah(product.price)}</p>
          )}
        </div>

        <div className="h-px w-full bg-slate-100 dark:bg-slate-900"></div>

        {/* Variants Section */}
        {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
          <div className="space-y-4">
            {product.variants.map((v, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{v.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {v.options && v.options.map((opt) => {
                    const variantKey = `${v.name}:${opt}`;
                    const priceAdjustment = product.variantPrices?.[variantKey] || 0;
                    const optionPrice = product.price + priceAdjustment;
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => handleVariantChange(v.name, opt)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${ 
                          selectedVariants[v.name] === opt
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                        }`}
                      >
                        {opt}
                        {priceAdjustment !== 0 && (
                          <span className="ml-1 text-[10px]">
                            {priceAdjustment > 0 ? `+${formatRupiah(priceAdjustment)}` : formatRupiah(priceAdjustment)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Section */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-900 dark:text-white">Jumlah</span>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-white hover:text-primary transition-colors"><Minus size={16}/></button>
            <span className="text-sm font-bold w-4 text-center dark:text-white">{qty}</span>
            <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg shadow-sm hover:bg-orange-600 transition-colors"><Plus size={16}/></button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm mb-2 dark:text-white flex items-center gap-2"><FileText size={16} className="text-primary"/> Deskripsi</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description || "Tidak ada deskripsi."}</p>
        </div>
      </div>

      {/* Dual Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto z-50 grid grid-cols-2 gap-3">
        <button 
          onClick={handleAddToCart} 
          disabled={product.stock === 0}
          className={`h-14 font-bold rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${product.stock === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          <ShoppingCart size={20} strokeWidth={2.5}/> 
          <span className="text-sm">{product.stock === 0 ? 'Stok Habis' : 'Keranjang'}</span>
        </button>
        
        <button 
          onClick={handleBuyNow} 
          disabled={product.stock === 0}
          className={`h-14 font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${product.stock === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30 hover:bg-orange-600'}`}
        >
          <ShoppingBag size={20} strokeWidth={2.5}/> 
          <span className="text-sm">Pesan Sekarang</span>
        </button>
      </div>
    </div>
  );
};

const CartView = ({ cart, updateCartQty, removeFromCart, navigate }) => {
  const total = cart.reduce((acc, item) => acc + ((item.finalPrice || item.price) * item.qty), 0);
  
  const formatVariants = (variants) => {
    if (!variants || Object.keys(variants).length === 0) return '';
    return Object.entries(variants).map(([key, val]) => `${val}`).join(', ');
  };

  return (
    <div className="pb-32 flex flex-col h-screen animate-in slide-in-from-right duration-300">
      <Header title="Keranjang" showCart={false} backTo="home" navigate={navigate} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
              <ShoppingBag size={40} />
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">Keranjang Kosong</p>
            <p className="text-slate-500 text-sm mt-1">Yuk isi dengan barang impianmu!</p>
            <button onClick={() => navigate('home')} className="mt-6 px-6 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold hover:bg-primary/20 transition-colors">Mulai Belanja</button>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30">
              <img src={item.img} className="w-24 h-24 rounded-xl object-cover bg-slate-100" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                  {Object.keys(item.variants || {}).length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatVariants(item.variants)}</p>
                  )}
                  <p className="text-sm text-primary font-bold mt-1">{formatRupiah(item.finalPrice || item.price)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-800">
                    <button onClick={() => updateCartQty(item.id, -1, item.variants)} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg shadow-sm text-slate-600 dark:text-white active:scale-90 transition-transform"><Minus size={14}/></button>
                    <span className="text-sm font-bold w-4 text-center dark:text-white">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1, item.variants)} className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg shadow-sm shadow-primary/30 active:scale-90 transition-transform"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.variants)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-5 max-w-md mx-auto z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Pembayaran</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatRupiah(total)}</p>
            </div>
          </div>
          <button onClick={() => navigate('checkout')} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex justify-between items-center px-6 group">
            <span>Checkout Sekarang</span>
            <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

const CheckoutView = ({ cart, userProfile, setUserProfile, handleCheckout, navigate, settings }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [regForm, setRegForm] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    subdistrict: '', 
    village: '', 
    full_address: '' 
  });
  
  const [checkoutForm, setCheckoutForm] = useState({ 
    name: userProfile.name || '', 
    phone: userProfile.phone || '', 
    address: userProfile.address || '',
    subdistrict: userProfile.subdistrict || '',
    village: userProfile.village || '',
    full_address: userProfile.full_address || '',
    paymentMethod: 'COD'
  });
  
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  useEffect(() => {
    if(userProfile.phone) {
      setCheckoutForm({ 
        name: userProfile.name, 
        phone: userProfile.phone, 
        address: userProfile.address,
        subdistrict: userProfile.subdistrict || '',
        village: userProfile.village || '',
        full_address: userProfile.full_address || '',
        paymentMethod: 'COD'
      });
    }
  }, [userProfile]);

  const total = cart.reduce((a,b)=>a+((b.finalPrice || b.price)*b.qty),0);
  const formatVariants = (variants) => (!variants || Object.keys(variants).length === 0) ? '' : `(${Object.values(variants).join(', ')})`;

  const handleInlineLogin = async () => {
    setLoading(true);
    try {
      // Format nomor telepon untuk query
      const formattedPhone = formatPhoneForWhatsApp(loginPhone);
      const { data, error } = await supabase.from('customers').select('*').eq('phone', formattedPhone).single();
      if(error || !data) {
        alert("Nomor belum terdaftar. Silakan daftar terlebih dahulu.");
      } else {
        setUserProfile(data);
      }
    } catch(e) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const handleInlineRegister = async () => {
    if(!regForm.name || !regForm.phone || !regForm.address || !regForm.subdistrict || !regForm.village) {
      alert("Mohon lengkapi semua data yang wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      // Format nomor telepon sebelum menyimpan
      const formattedPhone = formatPhoneForWhatsApp(regForm.phone);
      const customerData = {
        ...regForm,
        phone: formattedPhone
      };
      
      const { error } = await supabase.from('customers').upsert(customerData, {
        onConflict: 'phone',
        ignoreDuplicates: false
      });
      if(error) throw error;
      setUserProfile(customerData);
    } catch(e) {
       alert("Gagal mendaftar: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Nomor rekening berhasil disalin!');
  };

  // GUEST / LOGIN VIEW
  if (!userProfile.phone) {
    return (
       <div className="pb-24 animate-in slide-in-from-right duration-300 bg-background-light dark:bg-background-dark min-h-screen">
         <Header title="Identitas Pemesan" showCart={false} backTo="cart" navigate={navigate} />
         <div className="p-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                   <button onClick={()=>setIsLoginMode(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white dark:bg-gray-900 shadow-sm text-primary' : 'text-slate-400'}`}>Masuk</button>
                   <button onClick={()=>setIsLoginMode(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white dark:bg-gray-900 shadow-sm text-primary' : 'text-slate-400'}`}>Daftar Baru</button>
                </div>

                {isLoginMode ? (
                   <div className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-slate-500">Masukkan nomor WhatsApp yang sudah terdaftar untuk mengisi data otomatis.</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nomor WhatsApp</label>
                        <input 
                          value={loginPhone} 
                          onChange={e => setLoginPhone(e.target.value)}
                          className="w-full h-14 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none dark:text-white font-bold text-lg text-center" 
                          type="tel" 
                          placeholder="0858... / 62858..."
                        />
                      </div>
                      <button onClick={handleInlineLogin} disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                         {loading ? <Loader2 className="animate-spin"/> : 'Cek Data Saya'}
                      </button>
                   </div>
                ) : (
                   <div className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-slate-500">Isi data diri Anda untuk pengiriman.</p>
                        <p className="text-xs text-slate-400 mt-1">Nomor WhatsApp akan diformat otomatis</p>
                      </div>
                      <input value={regForm.name} onChange={e=>setRegForm({...regForm, name:e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary dark:text-white" placeholder="Nama Lengkap"/>
                      <input value={regForm.phone} onChange={e=>setRegForm({...regForm, phone:e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none focus:border-primary dark:text-white" placeholder="0858... / 62858..." type="tel"/>
                      
                      <AddressForm formData={regForm} onChange={setRegForm} />
                      
                      <button onClick={handleInlineRegister} disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                         {loading ? <Loader2 className="animate-spin"/> : 'Lanjut ke Pembayaran'}
                      </button>
                   </div>
                )}
            </div>
         </div>
       </div>
    );
  }

  // LOGGED IN VIEW
  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <Header title="Checkout" showCart={false} backTo="cart" navigate={navigate} />
      <div className="p-4 space-y-6">
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
             <h3 className="font-bold dark:text-white flex items-center gap-2"><MapPin size={18} className="text-primary"/> Alamat Pengiriman</h3>
             <button onClick={() => setUserProfile({...userProfile, phone: null})} className="text-xs text-red-500 font-bold hover:underline">Ganti Akun</button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold dark:text-white">Gunakan alamat tersimpan</span>
              <div 
                onClick={() => setUseSavedAddress(!useSavedAddress)}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${useSavedAddress ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${useSavedAddress ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            
            {useSavedAddress ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">Nama Penerima</label>
                  <input value={checkoutForm.name} onChange={e=>setCheckoutForm({...checkoutForm, name:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="Nama Lengkap"/>
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1 font-bold">WhatsApp</label>
                  <input value={checkoutForm.phone} onChange={e=>setCheckoutForm({...checkoutForm, phone:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" placeholder="0858... / 62858..." type="tel"/>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-bold dark:text-white mb-1">Alamat Tersimpan:</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {userProfile.subdistrict && <span>{userProfile.subdistrict}, </span>}
                    {userProfile.village && <span>{userProfile.village}, </span>}
                    {userProfile.address && <span>{userProfile.address}</span>}
                    {userProfile.full_address && <span><br/>{userProfile.full_address}</span>}
                  </p>
                </div>
              </div>
            ) : (
              <AddressForm formData={checkoutForm} onChange={setCheckoutForm} />
            )}
          </div>
        </section>
        
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><CreditCard size={18} className="text-primary"/> Metode Pembayaran</h3>
          <div className="space-y-3">
            {settings.paymentMethods?.map((method, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutForm.paymentMethod === method ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                    {method === 'COD' ? <Wallet size={16}/> : <Banknote size={16}/>}
                  </div>
                  <span className="font-bold dark:text-white">{method}</span>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={checkoutForm.paymentMethod === method}
                  onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value})}
                  className="w-5 h-5 text-primary"
                />
              </div>
            ))}
          </div>
        </section>
        
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><ShoppingBag size={18} className="text-primary"/> Ringkasan Pesanan</h3>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 text-sm border-b border-dashed border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {item.name} <span className="text-xs text-slate-400">{formatVariants(item.variants)}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 rounded ml-1">x{item.qty}</span>
                </span>
                <span className="font-bold dark:text-white">{formatRupiah((item.finalPrice || item.price) * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 mt-2 bg-slate-50 dark:bg-slate-800/50 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-slate-100 dark:border-slate-800">
            <span className="font-bold text-lg dark:text-white">Total Bayar</span>
            <span className="font-extrabold text-xl text-primary">{formatRupiah(total)}</span>
          </div>
        </section>
        
        {/* INFORMASI PEMBAYARAN */}
        <section className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2"><AlertTriangle size={18} className="text-blue-600"/> Informasi Pembayaran</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            <span className="font-bold">Pesanan akan diproses setelah pembayaran dan pengiriman bukti via WhatsApp Admin.</span>
          </p>
          
          {checkoutForm.paymentMethod !== 'COD' && settings.bankAccounts?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold dark:text-white mb-2">Transfer ke Rekening:</p>
              <div className="space-y-2">
                {settings.bankAccounts.map((account, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold dark:text-white">{account.bank}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{account.number}</p>
                        <p className="text-xs text-slate-500">a.n. {account.name}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(account.number)}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        <Copy size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {checkoutForm.paymentMethod === 'COD' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                <span className="font-bold">COD (Cash On Delivery):</span> Bayar ketika barang sampai di alamat Anda.
              </p>
            </div>
          )}
          
          {checkoutForm.paymentMethod === 'Ambil di Kantor' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                <span className="font-bold">Ambil di Kantor:</span> Bayar dan ambil barang langsung di kantor kami.
              </p>
            </div>
          )}
        </section>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto z-50">
        <button 
          onClick={() => handleCheckout(checkoutForm)} 
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Smartphone size={22}/> Konfirmasi Pesanan
        </button>
      </div>
    </div>
  );
};

const OrdersView = ({ orders, navigate, userPhone, onCancelOrder, settings }) => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const userOrders = orders.filter(order => order.phone === userPhone);
  
  const filteredOrders = activeFilter === 'Semua' 
    ? userOrders 
    : userOrders.filter(order => {
        if (activeFilter === 'Belum Bayar') return order.status === 'Menunggu';
        if (activeFilter === 'Dibatalkan') return order.status === 'Dibatalkan';
        return order.status === activeFilter;
      });

  // Jika ada order yang dipilih, tampilkan detail
  if (selectedOrder) {
  return (
    <OrderDetailView 
      order={selectedOrder}
      navigate={navigate}
      settings={settings}
      userProfile={{ phone: userPhone }}
      onCancelOrder={onCancelOrder}
    />
  );
  }

  const filterOptions = ['Semua', 'Belum Bayar', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <Header title="Pesanan Saya" showCart={false} backTo="home" navigate={navigate} />
      
      {/* Filter Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterOptions.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={40} className="text-slate-400"/>
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-lg mb-2">Belum ada pesanan</p>
            <p className="text-slate-500 text-sm">Yuk, mulai belanja dan checkout pesanan pertama Anda!</p>
          </div>
        ) : 
          filteredOrders.map((order, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedOrder(order)}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20 active:scale-[0.99] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    order.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                    order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    order.status === 'Dikemas' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    order.status === 'Dibatalkan' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {order.status === 'Selesai' ? <CheckCircle size={20}/> : 
                     order.status === 'Dikirim' ? <Truck size={20}/> :
                     order.status === 'Dikemas' ? <Package size={20}/> :
                     order.status === 'Dibatalkan' ? <Trash2 size={20}/> :
                     <Clock size={20}/>}
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      order.status === 'Selesai' ? 'text-green-600 dark:text-green-400' : 
                      order.status === 'Dikirim' ? 'text-blue-600 dark:text-blue-400' :
                      order.status === 'Dikemas' ? 'text-yellow-600 dark:text-yellow-400' :
                      order.status === 'Dibatalkan' ? 'text-red-600 dark:text-red-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>{order.status}</span>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{order.date}</div>
                    <div className="text-xs text-slate-500 mt-1">{order.payment_method}</div>
                  </div>
                </div>
                <div className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{order.id}</div>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{item.name} {item.variants && <span className="text-xs text-slate-400">{formatVariantString(item.variants)}</span>}</span>
                    <span className="font-bold text-slate-400">x{item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 font-medium uppercase">Total Belanja</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">{formatRupiah(order.total)}</span>
              </div>
              
              {/* Action Button untuk order Menunggu */}
              {order.status === 'Menunggu' && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Apakah Anda yakin ingin membatalkan pesanan #${order.id}?`)) {
                        onCancelOrder(order.id);
                      }
                    }}
                    className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={16} />
                    Batalkan Pesanan
                  </button>
                </div>
              )}
            </div>
          ))
        }
      </div>
      <BottomNav role="customer" currentView="orders" navigate={navigate} />
    </div>
  );
};

const SavedView = ({ saved, navigate }) => (
  <div className="pb-24 animate-in fade-in duration-300">
    <Header title="Disimpan" showCart={false} backTo="home" navigate={navigate} />
    <div className="p-4 grid grid-cols-2 gap-4">
      {saved.length === 0 ? <div className="col-span-2 text-center py-20 text-slate-500">Belum ada produk disimpan.</div> :
        saved.map(item => (
          <div key={item.id} onClick={() => navigate('product', item)} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform group cursor-pointer">
            <div className="aspect-square bg-slate-100 relative">
              <img src={item.img} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
              <div className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-black/50 backdrop-blur rounded-full text-red-500 shadow-sm"><Heart size={16} className="fill-current"/></div>
            </div>
            <div className="p-3.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{item.name}</h3>
              <div className="text-sm font-bold text-primary">{formatRupiah(item.price)}</div>
            </div>
          </div>
        ))
      }
    </div>
    <BottomNav role="customer" currentView="saved" navigate={navigate} />
  </div>
);

const UserLogin = ({ onLogin }) => {
    const [phone, setPhone] = useState('');
    
    const handleLogin = () => {
      if (!phone) {
        alert("Mohon masukkan nomor telepon");
        return;
      }
      onLogin(phone);
    };
    
    return (
        <div className="min-h-screen flex flex-col justify-center p-6 bg-background-light dark:bg-background-dark max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary"><Smartphone size={32}/></div>
                <h2 className="text-2xl font-bold dark:text-white">Masuk / Daftar</h2>
                <p className="text-sm text-slate-500">Masukkan nomor HP untuk mengakses profil Anda.</p>
                <p className="text-xs text-slate-400 mt-1">Format: 0858..., 62858..., atau +62858...</p>
            </div>
            <input 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full h-14 px-4 rounded-xl border dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white text-center text-lg font-bold tracking-wider mb-4" 
              placeholder="0858... / 62858..." 
              type="tel"
            />
            <button onClick={handleLogin} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg">Lanjutkan</button>
        </div>
    )
}

// ==========================================
// HALAMAN LAPORAN PENDAPATAN
// ==========================================
const RevenueReportView = ({ orders, formatRupiah, navigate }) => {
  const validStatuses = ['Dikemas', 'Dikirim', 'Selesai'];
  const revenueOrders = orders.filter(o => validStatuses.includes(o.status));
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  
  const formatVariants = (variants) => {
    if (!variants || typeof variants !== 'object' || Object.keys(variants).length === 0) return '';
    return `(${Object.values(variants).join(', ')})`;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <Header title="Laporan Pendapatan" showCart={false} backTo="admin-orders" navigate={navigate} />
      
      <div className="p-5">
        {/* Ringkasan Statistik */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-xl dark:text-white">Total Pendapatan</h2>
              <p className="text-sm text-slate-500">Dari {revenueOrders.length} pesanan yang diproses</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="text-primary" size={24} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-primary">{formatRupiah(totalRevenue)}</div>
        </div>
        
        {/* Tabel Semua Order */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-primary" />
              Semua Order ({orders.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-600 dark:text-slate-400">ID Order</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-600 dark:text-slate-400">Tanggal</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-600 dark:text-slate-400">Customer</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-600 dark:text-slate-400">Total</th>
                  <th className="text-left p-4 text-xs font-bold text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm font-medium dark:text-white">{order.id}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{order.date}</td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-medium dark:text-white">{order.customer}</div>
                        <div className="text-xs text-slate-500">{order.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-primary">{formatRupiah(order.total)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        order.status === 'Dikemas' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold text-lg">Belum ada pesanan</p>
              <p className="text-slate-500 text-sm mt-1">Tunggu pelanggan melakukan checkout</p>
            </div>
          )}
        </div>
        
        {/* Tombol Detail Lengkap */}
        <div className="mt-6">
          <button 
            onClick={() => navigate('admin-orders')}
            className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// EDIT PROFILE VIEW (DIPERBAIKI KONTRAST & FIX ERROR 409)
// ==========================================
const EditProfileView = ({ userProfile, onSave, navigate }) => {
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    address: userProfile.address || '',
    subdistrict: userProfile.subdistrict || '',
    village: userProfile.village || '',
    full_address: userProfile.full_address || '',
    avatar_url: userProfile.avatar_url || ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (event) => {
      try {
        setUploading(true);
        if (!event.target.files || event.target.files.length === 0) throw new Error('Pilih gambar.');
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        setFormData({ ...formData, avatar_url: data.publicUrl });
      } catch (error) {
        alert('Gagal upload: ' + error.message);
      } finally {
        setUploading(false);
      }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      alert('Nama dan nomor WhatsApp wajib diisi');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData, setSaving);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <Header title="Edit Profil" showCart={false} backTo="profile" navigate={navigate} />
      <div className="p-6 space-y-6 bg-background-light dark:bg-background-dark min-h-screen">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
              <img src={formData.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover transition-opacity group-hover:opacity-80"/>
            </div>
            <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <div className="bg-black/50 w-full h-full rounded-full flex items-center justify-center">
                <Camera className="text-white drop-shadow-md" size={32}/>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading}/>
            </label>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-slate-800 shadow-sm"><Edit size={16}/></div>
          </div>
          {uploading && <span className="text-xs text-primary mt-2">Mengupload...</span>}
        </div>
        
        {/* Form Section with Better Contrast */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Informasi Pribadi</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Nama Lengkap *</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 outline-none dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Email</label>
                <input 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 outline-none dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Email"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">Nomor WhatsApp *</label>
                <input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 outline-none dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="0858... / 62858..."
                  type="tel"
                />
                <p className="text-xs text-slate-500 mt-1">Format: 0858..., 62858..., atau +62858...</p>
              </div>
            </div>
          </div>
          
          {/* Address Form with Better Contrast */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Alamat Pengiriman
            </h3>
            <AddressForm formData={formData} onChange={setFormData} isInEditProfile={true} />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full h-14 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform hover:bg-orange-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
};

const ProfileView = ({ userProfile, navigate, setIsAdmin, onLogoutUser }) => (
  <div className="pb-24 animate-in slide-in-from-right duration-300">
    <Header title="Profil" showCart={false} backTo="home" navigate={navigate} />
    <div className="p-6 flex flex-col items-center bg-white dark:bg-gray-900 mb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg relative">
        <img src={userProfile.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover"/>
      </div>
      <h2 className="text-xl font-bold dark:text-white mb-1">{userProfile.name || "Pengguna"}</h2>
      <p className="text-sm text-slate-500 mb-4">{userProfile.phone}</p>
      <button onClick={() => navigate('edit-profile')} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white transition-colors border border-transparent dark:border-slate-700">Edit Profil</button>
    </div>
    
    <div className="px-4 space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <button onClick={() => navigate('orders')} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center"><ClipboardList size={20}/></div>
            <span className="dark:text-white font-bold text-sm">Pesanan Saya</span>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-slate-500" size={18}/>
        </button>
        <div className="h-px bg-slate-50 dark:bg-slate-800 mx-4"/>
        <button onClick={() => navigate('saved')} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center"><Heart size={20}/></div>
            <span className="dark:text-white font-bold text-sm">Disimpan</span>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-slate-500" size={18}/>
        </button>
      </div>

      <button onClick={onLogoutUser} className="w-full p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm flex items-center justify-between text-red-500 font-bold border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <div className="flex items-center gap-3"><LogOut size={20}/> Ganti Akun / Keluar</div>
      </button>
      
      <p className="text-center text-xs text-slate-400 mt-4">Versi Aplikasi 2.5.0 (Pro)</p>
    </div>
    <BottomNav role="customer" currentView="profile" navigate={navigate} />
  </div>
);

/**
 * ==========================================
 * VIEW COMPONENTS (Admin Dashboard)
 * ==========================================
 */

const AdminLogin = ({ onLogin, navigate }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-background-light dark:bg-background-dark max-w-md mx-auto">
      <div className="w-20 h-20 bg-gradient-to-tr from-primary to-orange-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 text-white transform rotate-3"><ShieldCheck size={40}/></div>
      <h1 className="text-3xl font-extrabold mb-2 dark:text-white tracking-tight">Admin Portal</h1>
      <p className="text-sm text-slate-500 mb-10 text-center leading-relaxed">Kelola tokomu dengan mudah dan aman.</p>
      
      <div className="w-full space-y-4">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20}/>
          <input 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" 
            placeholder="Email" 
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20}/>
          <input 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" 
            type="password" 
            placeholder="Password" 
          />
        </div>
        <button onClick={() => onLogin(email, pass)} className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 text-lg">Masuk Dashboard</button>
        <button onClick={() => navigate('home')} className="w-full py-4 text-slate-500 font-bold text-sm hover:text-primary transition-colors">Kembali ke Toko</button>
      </div>
    </div>
  );
};

const AdminOrdersView = ({ orders, updateOrderStatus, formatRupiah, navigate, storeSettings }) => {
  const validStatuses = ['Dikemas', 'Dikirim', 'Selesai'];
  const revenueOrders = orders.filter(o => validStatuses.includes(o.status));
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  
  const activeOrders = orders.filter(o => o.status !== 'Selesai' && o.status !== 'Dibatalkan').length;

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a120b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-xl dark:text-white">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Overview Toko Hari Ini</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover"/>
        </div>
      </header>

      <div className="p-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* CARD PENDAPATAN */}
          <button 
            onClick={() => navigate('admin-revenue-report')}
            className="bg-gradient-to-br from-primary to-orange-600 p-4 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden text-left active:scale-[0.98] transition-transform group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1 opacity-90"><BarChart3 size={16}/><span className="text-xs font-bold uppercase">Pendapatan</span></div>
              <p className="text-xl font-extrabold">{formatRupiah(totalRevenue)}</p>
              <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1 group-hover:underline">
                Klik untuk lihat laporan lengkap <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="absolute bottom-0 right-0 w-full h-10 flex items-end justify-end gap-1 px-4 opacity-30">
                <div className="w-2 bg-white h-[40%] rounded-t-sm"></div>
                <div className="w-2 bg-white h-[70%] rounded-t-sm"></div>
                <div className="w-2 bg-white h-[50%] rounded-t-sm"></div>
                <div className="w-2 bg-white h-[90%] rounded-t-sm"></div>
                <div className="w-2 bg-white h-[60%] rounded-t-sm"></div>
            </div>
          </button>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1 text-slate-500"><Activity size={16}/><span className="text-xs font-bold uppercase">Order Aktif</span></div>
            <p className="text-2xl font-extrabold dark:text-white">{activeOrders}</p>
             <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-700"></div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><ClipboardList size={20}/> Daftar Pesanan Terbaru</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => {
              const whatsappNumber = formatPhoneForWhatsApp(order.phone);
              
              return (
                <div key={order.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/20">
                  <div className="flex justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm dark:text-white">{order.id}</span>
                      <span className="text-xs text-slate-400">{order.date}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold h-fit ${order.status === 'Selesai' ? 'bg-green-100 text-green-700' : order.status === 'Dibatalkan' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>{order.status}</span>
                  </div>
                  <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{order.customer}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {order.items.map(x => {
                        const variants = x.selectedVariants ? `(${Object.values(x.selectedVariants).join(', ')})` : '';
                        return `${x.name} ${variants} (${x.qty}x)`;
                      }).join(', ')}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent dark:text-white outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dikemas">Dikemas</option>
                      <option value="Dikirim">Dikirim</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-primary">{formatRupiah(order.total)}</span>
                      <button 
                        onClick={() => {
                          if (whatsappNumber) {
                            const message = `Halo ${order.customer}, admin toko ${storeSettings.storeName} menghubungi Anda mengenai pesanan #${order.id}`;
                            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                          } else {
                            alert('Nomor telepon pelanggan tidak tersedia.');
                          }
                        }} 
                        className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                        title="Hubungi Pembeli"
                      >
                        <Phone size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <BottomNav role="admin" currentView="admin-orders" navigate={navigate} />
    </div>
  );
};

const AdminInventoryView = ({ products, formatRupiah, navigate }) => (
  <div className="pb-24 animate-in fade-in duration-300">
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a120b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center">
      <h1 className="font-extrabold text-xl dark:text-white">Inventaris ({products.length})</h1>
      <button onClick={() => navigate('admin-add-product')} className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Plus size={24}/></button>
    </header>
    <div className="p-4 space-y-3">
      {products.map(item => (
        <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/30 group">
          <div className="relative w-20 h-20 shrink-0">
            {item.img ? (
              <img src={item.img} className="w-full h-full rounded-xl object-cover bg-slate-100" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-400"/>
              </div>
            )}
            {item.stock < 10 && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><AlertTriangle className="text-yellow-400" size={24}/></div>}
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm dark:text-white line-clamp-1 mb-1">{item.name}</h3>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">{item.category}</span>
              </div>
              <button onClick={() => navigate('admin-edit-product', item)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"><Edit size={16}/></button>
            </div>
            <div className="flex justify-between items-end">
              <div className="font-bold text-primary">{formatRupiah(item.price)}</div>
              <div className={`text-xs font-bold px-2 py-1 rounded ${item.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>Stok: {item.stock}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="fixed bottom-24 right-4 z-40 max-w-md mx-auto">
      <button onClick={() => navigate('admin-add-product')} className="flex items-center gap-2 bg-primary text-white h-14 px-6 rounded-full shadow-lg font-bold hover:scale-105 active:scale-95 transition-transform">
        <Plus size={24}/> Tambah Produk
      </button>
    </div>
    <BottomNav role="admin" currentView="admin-inventory" navigate={navigate} />
  </div>
);

const ProductForm = ({ initialData, onSave, onDelete, categories, navigate }) => {
  const [form, setForm] = useState(initialData || { 
    name: '', 
    price: '', 
    stock: '', 
    category: 'Fesyen', 
    description: '', 
    img: '',
    images: [],
    variants: [],
    variantImages: {},
    variantPrices: {}
  });

  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantOptions, setNewVariantOptions] = useState('');
  const [newVariantAffectsPrice, setNewVariantAffectsPrice] = useState(false);
  const [galleryInput, setGalleryInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [variantImageFile, setVariantImageFile] = useState({});

  useEffect(() => {
    if (form.description && !form.desc) setForm(prev => ({...prev, desc: prev.description}));
    if (form.desc && !form.description) setForm(prev => ({...prev, description: prev.desc}));
    if (form.img && (!form.images || !form.images.includes(form.img))) {
      setForm(prev => ({ ...prev, images: [prev.img, ...(prev.images || [])] }));
    }
  }, []);

  const handleImageUpload = async (event, isMain = false) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Pilih gambar.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage.from('products').upload(filePath, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage.from('products').getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;

      if (isMain) {
        setForm(prev => ({ ...prev, img: publicUrl, images: [publicUrl, ...(prev.images || [])] }));
      } else {
        setForm(prev => ({ ...prev, images: [...(prev.images || []), publicUrl] }));
      }
    } catch (error) {
      alert('Gagal upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVariantImageUpload = async (event, option) => {
    try {
      if (!event.target.files || event.target.files.length === 0) throw new Error('Pilih gambar.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `variant_${option}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      
      setForm(prev => ({
        ...prev,
        variantImages: { ...prev.variantImages, [option]: data.publicUrl }
      }));
      
      setVariantImageFile(prev => ({ ...prev, [option]: file }));
      
    } catch (error) {
      alert('Gagal upload gambar varian: ' + error.message);
    }
  };

  const addVariant = () => {
    if (newVariantName && newVariantOptions) {
      const optionsArray = newVariantOptions.split(',').map(s => s.trim());
      setForm({
        ...form,
        variants: [...(form.variants || []), { 
          name: newVariantName, 
          options: optionsArray,
          affectsPrice: newVariantAffectsPrice 
        }]
      });
      setNewVariantName('');
      setNewVariantOptions('');
      setNewVariantAffectsPrice(false);
    }
  };

  const removeVariant = (index) => {
    const updatedVariants = [...form.variants];
    updatedVariants.splice(index, 1);
    setForm({ ...form, variants: updatedVariants });
  };

  const addGalleryImage = () => {
    if (galleryInput) {
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []), galleryInput]
      }));
      setGalleryInput('');
    }
  };

  const handleVariantPriceChange = (variantName, option, price) => {
    const key = `${variantName}:${option}`;
    setForm(prev => ({
      ...prev,
      variantPrices: { 
        ...prev.variantPrices, 
        [key]: parseInt(price) || 0 
      }
    }));
  };
  
  return (
    <div className="p-5 space-y-5 pb-24 bg-background-light dark:bg-background-dark min-h-screen">
      <Header title={initialData ? "Edit Produk" : "Tambah Produk"} showCart={false} backTo="admin-inventory" navigate={navigate} />
      
      {/* Main Image Preview */}
      <div className="relative w-full aspect-[2/1] bg-slate-100 dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden">
        {form.img && (
          <img src={form.img} className="absolute inset-0 w-full h-full object-cover opacity-60"/>
        )}
        <div className="relative z-10 flex flex-col items-center p-4 bg-white/80 dark:bg-black/60 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/90 transition-colors">
           <label className="flex flex-col items-center cursor-pointer">
             {uploading ? <Loader2 className="animate-spin text-primary"/> : <UploadCloud size={24} className="mb-2 text-primary"/>}
             <span className="text-xs font-bold dark:text-white">{uploading ? 'Mengupload...' : 'Upload Cover Utama'}</span>
             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading}/>
           </label>
        </div>
      </div>
      
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">URL Gambar Utama</label>
           <input value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white text-xs" placeholder="https://..."/>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Produk</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Contoh: Kemeja Flanel"/>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Harga Dasar</label>
            <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="0"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Stok</label>
            <input type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="0"/>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kategori</label>
          <div className="relative">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full h-14 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white font-medium appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
              {categories.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={18}/>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700">
           <h3 className="text-sm font-bold dark:text-white flex items-center gap-2"><ImageIcon size={16}/> Galeri Produk</h3>
           <div className="flex gap-2 overflow-x-auto pb-2">
             {form.images && form.images.map((img, idx) => (
               <div key={idx} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border dark:border-slate-600">
                 <img src={img} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
                 <button onClick={() => setForm(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
               </div>
             ))}
             <label className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Plus size={20} className="text-slate-400"/>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading}/>
             </label>
           </div>
           <div className="flex gap-2">
             <input value={galleryInput} onChange={e => setGalleryInput(e.target.value)} placeholder="URL Gambar Tambahan..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm dark:text-white outline-none"/>
             <button onClick={addGalleryImage} className="bg-primary text-white p-2 rounded-lg"><Plus size={16}/></button>
           </div>
        </div>

        {/* Dynamic Variants Section */}
        <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold dark:text-white flex items-center gap-2"><Layers size={16}/> Varian Produk</h3>
          
          {/* List Existing Variants */}
          {form.variants && form.variants.map((v, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm dark:text-white">{v.name}:</span> 
                  <span className="text-xs text-slate-500 ml-2">{v.options.join(', ')}</span>
                  {v.affectsPrice && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Mempengaruhi Harga</span>
                  )}
                </div>
                <button onClick={() => removeVariant(idx)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={14}/></button>
              </div>
              
              {/* Variant Price Inputs */}
              {v.affectsPrice && (
                <div className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                  <p className="text-[10px] text-slate-400 mb-1 font-bold">Harga Tambahan per Varian</p>
                  {v.options.map(opt => (
                     <div key={opt} className="flex items-center gap-2 mb-1">
                        <span className="text-xs w-12 dark:text-slate-300">{opt}</span>
                        <div className="relative flex-1">
                          <input 
                             type="number"
                             placeholder="Harga tambahan (contoh: 5000 atau -2000)"
                             value={form.variantPrices?.[`${v.name}:${opt}`] || 0}
                             onChange={(e) => handleVariantPriceChange(v.name, opt, e.target.value)}
                             className="w-full text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white outline-none"
                          />
                        </div>
                     </div>
                  ))}
                </div>
              )}
              
              {/* Variant Image Mapping UI */}
              <div className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">Gambar Varian (Opsional)</p>
                {v.options.map(opt => (
                   <div key={opt} className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-12 dark:text-slate-300">{opt}</span>
                      <div className="relative flex-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-16 h-16 rounded-lg overflow-hidden border flex items-center justify-center ${form.variantImages?.[opt] ? 'border-primary' : 'border-slate-200 dark:border-slate-600'}`}>
                            {form.variantImages?.[opt] ? (
                              <img src={form.variantImages[opt]} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}/>
                            ) : (
                              <Camera size={16} className="text-slate-400"/>
                            )}
                          </div>
                          <input 
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleVariantImageUpload(e, opt)}
                          />
                          <span className="text-xs text-primary font-bold">Upload</span>
                        </label>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <input 
              value={newVariantName} 
              onChange={e => setNewVariantName(e.target.value)} 
              placeholder="Nama (mis: Ukuran)" 
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm dark:text-white outline-none"
            />
            <input 
              value={newVariantOptions} 
              onChange={e => setNewVariantOptions(e.target.value)} 
              placeholder="Opsi (S, M, L)" 
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm dark:text-white outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="affectsPrice"
              checked={newVariantAffectsPrice}
              onChange={(e) => setNewVariantAffectsPrice(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="affectsPrice" className="text-sm dark:text-white">Varian ini mempengaruhi harga</label>
          </div>
          <button onClick={addVariant} className="w-full py-2 bg-primary/10 text-primary font-bold text-sm rounded-lg hover:bg-primary hover:text-white transition-colors">
            + Tambah Varian
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Deskripsi</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 outline-none dark:text-white resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed" placeholder="Deskripsi detail produk..."></textarea>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onDelete && <button onClick={onDelete} className="flex-1 h-14 border border-red-100 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"><Trash2 size={18}/> Hapus</button>}
        <button onClick={() => onSave(form)} className="flex-[2] h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform" disabled={uploading}><Save size={18}/> {uploading ? 'Mengupload...' : 'Simpan Produk'}</button>
      </div>
    </div>
  );
};

const AdminSettingsView = ({ settings, onSave, navigate, onLogout }) => {
  const [tempSettings, setTempSettings] = useState(settings);
  const [newCat, setNewCat] = useState('');
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [uploading, setUploading] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newBankAccount, setNewBankAccount] = useState({ bank: '', number: '', name: '' });
  const [saving, setSaving] = useState(false);

  // Load Admin Credentials
  useEffect(() => {
    const fetchCreds = async () => {
        const { data } = await supabase.from('admin_credentials').select('*').limit(1).single();
        if(data) setCreds({ email: data.email, password: data.password });
    };
    fetchCreds();
  }, []);

  const handleBannerUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Pilih gambar.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage.from('products').upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      setTempSettings({ ...tempSettings, heroImage: data.publicUrl });
    } catch (error) {
      alert('Gagal upload banner: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const addCat = () => {
    if (newCat) {
      setTempSettings({...tempSettings, categories: [...tempSettings.categories, newCat]});
      setNewCat('');
    }
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod && !tempSettings.paymentMethods.includes(newPaymentMethod)) {
      setTempSettings({...tempSettings, paymentMethods: [...tempSettings.paymentMethods, newPaymentMethod]});
      setNewPaymentMethod('');
    }
  };

  const addBankAccount = () => {
    if (newBankAccount.bank && newBankAccount.number && newBankAccount.name) {
      setTempSettings({...tempSettings, bankAccounts: [...tempSettings.bankAccounts, {...newBankAccount}]});
      setNewBankAccount({ bank: '', number: '', name: '' });
    }
  };

  const removePaymentMethod = (method) => {
    setTempSettings({...tempSettings, paymentMethods: tempSettings.paymentMethods.filter(m => m !== method)});
  };

  const removeBankAccount = (index) => {
    const updated = [...tempSettings.bankAccounts];
    updated.splice(index, 1);
    setTempSettings({...tempSettings, bankAccounts: updated});
  };

  const handleSaveAll = async () => {
    // Format nomor WhatsApp admin
    const formattedWhatsapp = formatPhoneForWhatsApp(tempSettings.whatsapp);
    const updatedSettings = {
      ...tempSettings,
      whatsapp: formattedWhatsapp
    };
    
    await onSave(updatedSettings);
    // Update Credentials if changed
    if(creds.email && creds.password) {
      const { error } = await supabase.from('admin_credentials').update(creds).gt('id', 0);
      if (error) console.error("Failed to update creds", error);
    }
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a120b]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center">
        <h1 className="font-extrabold text-xl dark:text-white">Pengaturan Toko</h1>
        <button onClick={handleSaveAll} className="text-primary font-bold hover:text-orange-600 transition-colors">Simpan</button>
      </header>
      <div className="p-5 space-y-8">
        
        {/* Banner Settings */}
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold dark:text-white mb-2 flex items-center gap-2"><ImageIcon size={18} className="text-primary"/> Banner Toko</h3>
            <div className="w-full aspect-[2/1] rounded-xl overflow-hidden relative group bg-slate-100">
                <img src={tempSettings.heroImage} className="w-full h-full object-cover"/>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold">
                    <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={uploading}/>
                    <Camera size={24} className="mr-2"/> Ganti Banner
                </label>
                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">Mengupload...</div>}
            </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg"><CreditCard size={20} className="text-primary"/> Metode Pembayaran</h3>
            <div className="space-y-2">
              {tempSettings.paymentMethods.map((method, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {method === 'COD' ? <Wallet size={16}/> : <Banknote size={16}/>}
                    </div>
                    <span className="font-bold dark:text-white">{method}</span>
                  </div>
                  <button onClick={() => removePaymentMethod(method)} className="text-red-500 hover:bg-red-100 p-1 rounded"><X size={16}/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={newPaymentMethod}
                onChange={e => setNewPaymentMethod(e.target.value)}
                placeholder="Tambah metode baru (contoh: Transfer Bank)"
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white outline-none border border-transparent focus:border-primary transition-colors"
              />
              <button onClick={addPaymentMethod} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">Tambah</button>
            </div>
        </section>

        {/* Bank Accounts */}
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg"><Banknote size={20} className="text-primary"/> Rekening Bank</h3>
            <div className="space-y-2">
              {tempSettings.bankAccounts.map((account, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold dark:text-white">{account.bank}</span>
                    <button onClick={() => removeBankAccount(idx)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={14}/></button>
                  </div>
                  <p className="text-sm dark:text-slate-300">{account.number}</p>
                  <p className="text-xs text-slate-500">a.n. {account.name}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <input 
                value={newBankAccount.bank}
                onChange={e => setNewBankAccount({...newBankAccount, bank: e.target.value})}
                placeholder="Nama Bank (contoh: BCA)"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white outline-none border border-transparent focus:border-primary transition-colors"
              />
              <input 
                value={newBankAccount.number}
                onChange={e => setNewBankAccount({...newBankAccount, number: e.target.value})}
                placeholder="Nomor Rekening"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white outline-none border border-transparent focus:border-primary transition-colors"
              />
              <input 
                value={newBankAccount.name}
                onChange={e => setNewBankAccount({...newBankAccount, name: e.target.value})}
                placeholder="Atas Nama"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white outline-none border border-transparent focus:border-primary transition-colors"
              />
              <button onClick={addBankAccount} className="w-full bg-primary/10 text-primary py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">Tambah Rekening</button>
            </div>
        </section>

        {/* Theme Settings */}
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold dark:text-white flex items-center gap-2 mb-4 text-lg"><Grid size={20} className="text-primary"/> Tampilan Toko</h3>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            <span className="font-medium dark:text-white text-sm">Mode Gelap (Dark Mode)</span>
            <div 
              onClick={() => setTempSettings({...tempSettings, theme: tempSettings.theme === 'light' ? 'dark' : 'light'})}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${tempSettings.theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${tempSettings.theme === 'dark' ? 'translate-x-6' : ''}`}>
                {tempSettings.theme === 'dark' ? <Moon size={12} className="text-primary"/> : <Sun size={12} className="text-yellow-500"/>}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">*Mengubah ini akan mengganti tampilan toko untuk semua pengunjung.</p>
        </section>

        {/* Admin Credentials */}
        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg"><KeyRound size={20} className="text-primary"/> Akun Admin</h3>
            <div>
              <label className="text-xs font-bold text-slate-400">Email Admin</label>
              <input value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 dark:text-white outline-none font-medium focus:border-primary transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Password Admin</label>
              <input value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 dark:text-white outline-none font-medium focus:border-primary transition-colors"/>
            </div>
            <p className="text-xs text-orange-500 italic">*Disimpan dalam database untuk pemulihan.</p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg"><Settings size={20} className="text-primary"/> Info Umum</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Nama Toko</label>
              <input value={tempSettings.storeName} onChange={e => setTempSettings({...tempSettings, storeName: e.target.value})} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 dark:text-white outline-none font-medium focus:border-primary transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Nomor WhatsApp Admin</label>
              <input 
                value={tempSettings.whatsapp} 
                onChange={e => setTempSettings({...tempSettings, whatsapp: e.target.value})} 
                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 dark:text-white outline-none font-medium focus:border-primary transition-colors"
                placeholder="0858... / 62858..."
              />
              <p className="text-xs text-slate-500 mt-1">Format: 0858..., 62858..., atau +62858...</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Teks Promo Banner</label>
              <input value={tempSettings.promoText} onChange={e => setTempSettings({...tempSettings, promoText: e.target.value})} className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 dark:text-white outline-none font-medium focus:border-primary transition-colors"/>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg"><Tag size={18}/> Kategori Produk</h3>
          <div className="flex flex-wrap gap-2">
            {tempSettings.categories.map((c, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold dark:text-white flex items-center gap-2 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                {c} <button onClick={() => setTempSettings({...tempSettings, categories: tempSettings.categories.filter(x => x !== c)})} className="hover:text-red-500 transition-colors"><X size={12}/></button>
              </span>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Tambah Kategori Baru..." className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white outline-none border border-transparent focus:border-primary transition-colors"/>
            <button onClick={addCat} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">Tambah</button>
          </div>
        </section>

        <button 
          onClick={onLogout} 
          className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl shadow-sm flex items-center justify-center text-red-600 font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors gap-2"
        >
          <LogOut size={20}/> Keluar dari Admin
        </button>
      </div>
      <BottomNav role="admin" currentView="admin-settings" navigate={navigate} />
    </div>
  );
};

/**
 * ==========================================
 * MAIN APP (Controller)
 * ==========================================
 */
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(INITIAL_DB.settings);
  const [userProfile, setUserProfile] = useState(INITIAL_DB.user);
  
  // Session States - Load from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [saved, setSaved] = useState(() => {
    const savedItems = localStorage.getItem('saved');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Save cart and saved to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('saved', JSON.stringify(saved));
  }, [saved]);

  // ==========================================
  // FIX: REDUCED SENSITIVITY SWIPE BACK
  // ==========================================
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);
      
      // Reduced sensitivity: 
      // 1. Minimum 150px swipe (instead of 100px)
      // 2. Only if vertical movement is small (< 50px)
      // 3. Don't allow swipe back from home screen
      // 4. Don't allow swipe back from login screens
      
      const sensitiveViews = ['home', 'admin-login', 'profile', 'admin-settings'];
      if (sensitiveViews.includes(currentView)) return;
      
      if (diffX > 150 && diffY < 50) {
        navigate('back');
      }
    };
    
    // Add passive listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentView]);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleSupabaseError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    
    // Handle 409 Conflict error (duplicate key)
    if (error && error.code === '23505') {
      showToast("Data sudah ada. Tidak perlu diperbarui.", "error");
      return;
    }
    
    if (error && error.code === '42501') {
      showToast("Izin Ditolak: Periksa policy Supabase.", "error");
    } else {
      showToast(`${context} Gagal: ${error?.message || "Kesalahan Jaringan"}`, "error");
    }
  };

  const navigate = (view, data = null) => {
    if (view === 'back') {
      const viewHistory = [
        'home', 'product', 'cart', 'checkout', 'orders', 'order-detail', 'saved', 
        'profile', 'edit-profile', 'admin-orders', 'admin-revenue-report', 
        'admin-inventory', 'admin-add-product', 'admin-edit-product', 'admin-settings'
      ];
      const currentIndex = viewHistory.indexOf(currentView);
      if (currentIndex > 0) {
        setCurrentView(viewHistory[currentIndex - 1]);
      } else {
        setCurrentView('home');
      }
      return;
    }
    
    if (data) {
      if (view === 'product') setSelectedProduct(data);
      if (view === 'admin-edit-product') setEditingProduct(data);
      if (view === 'order-detail') setSelectedOrder(data);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  // --- FETCH DATA FROM SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Settings
        let { data: settingsData, error: settingsError } = await supabase.from('store_settings').select('*').single();
        
        if (!settingsData && (settingsError?.code === 'PGRST116' || !settingsError)) {
             console.log("Database Settings Kosong. Melakukan Seeding Data Awal...");
             const initialSettingsDB = mapSettingsToDB(INITIAL_DB.settings);
             const { data: inserted, error: insertError } = await supabase.from('store_settings').upsert({ ...initialSettingsDB, id: 1 }).select().single();
             
             if (inserted) {
                 settingsData = inserted;
                 console.log("Seeding Berhasil.");
             } else if (insertError) {
                 console.error("Gagal Seeding:", insertError);
             }
        } else if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Gagal membaca settings:", settingsError);
        }

        if (settingsData) {
          const formattedSettings = mapSettingsFromDB(settingsData);
          if (formattedSettings.whatsapp) {
            formattedSettings.whatsapp = formatPhoneForWhatsApp(formattedSettings.whatsapp);
          }
          setSettings(formattedSettings);
        }

        // 2. Fetch Products
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) setProducts(productsData.map(mapProductFromDB));

        // 3. Fetch Orders
        const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ordersData) setOrders(ordersData.map(mapOrderFromDB));
        
      } catch (error) {
        console.error("Critical Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Theme Management ---
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // --- Actions ---
  
  const addToCart = (product, selectedVariants = {}, quantity = 1, finalPrice = null) => {
    let calculatedFinalPrice = finalPrice || product.price;
    
    if (product.variantPrices && selectedVariants) {
      Object.entries(selectedVariants).forEach(([variantName, option]) => {
        const variantKey = `${variantName}:${option}`;
        if (product.variantPrices[variantKey]) {
          calculatedFinalPrice += product.variantPrices[variantKey];
        }
      });
    }
    
    setCart(prev => {
      const existIndex = prev.findIndex(p => 
        p.id === product.id && areVariantsEqual(p.variants, selectedVariants)
      );

      if (existIndex > -1) {
        const newCart = [...prev];
        newCart[existIndex].qty += quantity;
        newCart[existIndex].finalPrice = calculatedFinalPrice;
        return newCart;
      }
      return [...prev, { 
        ...product, 
        qty: quantity, 
        variants: selectedVariants,
        finalPrice: calculatedFinalPrice 
      }];
    });
    
    setProducts(prev => prev.map(p => {
        if(p.id === product.id) {
            return {...p, stock: Math.max(0, p.stock - quantity)};
        }
        return p;
    }));

    showToast("Berhasil masuk keranjang");
  };

  const updateCartQty = (id, delta, itemVariants) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && areVariantsEqual(item.variants, itemVariants)) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id, itemVariants) => {
    setCart(prev => prev.filter(item => !(item.id === id && areVariantsEqual(item.variants, itemVariants))));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const toggleSaved = (product) => {
    const isSaved = saved.find(i => i.id === product.id);
    if(isSaved) {
      setSaved(saved.filter(i => i.id !== product.id));
      showToast("Dihapus dari disimpan");
    } else {
      setSaved([...saved, product]);
      showToast("Disimpan");
    }
  };

  const handleCheckout = async (userData) => {
    const formattedPhone = formatPhoneForWhatsApp(userData.phone);
    const checkoutData = {
      ...userData,
      phone: formattedPhone
    };
    
    const total = cart.reduce((sum, item) => sum + ((item.finalPrice || item.price) * item.qty), 0);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('id-ID'),
      status: "Menunggu",
      customer: checkoutData.name,
      phone: formattedPhone,
      address: checkoutData.address,
      subdistrict: checkoutData.subdistrict,
      village: checkoutData.village,
      full_address: checkoutData.full_address,
      payment_method: checkoutData.paymentMethod,
      total: total,
      items: cart
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    showToast("Pesanan berhasil dibuat! Status: Menunggu");

    // Save to Supabase
    const { error } = await supabase.from('orders').insert([{
        id: newOrder.id,
        date: newOrder.date,
        status: newOrder.status,
        customer: newOrder.customer,
        phone: formattedPhone,
        address: newOrder.address,
        subdistrict: newOrder.subdistrict,
        village: newOrder.village,
        full_address: newOrder.full_address,
        payment_method: newOrder.payment_method,
        total: newOrder.total,
        items: JSON.stringify(newOrder.items) 
    }]);

    if (error) {
      handleSupabaseError(error, "Checkout (Simpan Order)");
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      // Update Stock
      for (const item of cart) {
        const newStock = Math.max(0, item.stock - item.qty);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
      }

      navigate('orders');
      
      // Send WhatsApp notification
      if (settings.whatsapp) {
        const itemsList = cart.map(i => {
          const vars = i.variants ? ` ${formatVariantString(i.variants)}` : '';
          return `- ${i.name}${vars} (${i.qty}x)`;
        }).join('%0a');
        
        const message = `🛒 *PESANAN BARU* %0a%0aID: ${orderId}%0aNama: ${checkoutData.name}%0aTelepon: ${formattedPhone}%0aMetode: ${checkoutData.paymentMethod}%0a%0a*Items:*%0a${itemsList}%0a%0a*Total:* ${formatRupiah(total)}%0a%0a*Alamat:*%0a${checkoutData.subdistrict}, ${checkoutData.village}, ${checkoutData.address}%0a${checkoutData.full_address || ''}`;
        
        window.open(`https://wa.me/${settings.whatsapp}?text=${message}`, '_blank');
        
        if (checkoutData.paymentMethod !== 'COD') {
          const customerMessage = `Terima kasih telah berbelanja di ${settings.storeName}!%0a%0a*Detail Pesanan:*%0aID: ${orderId}%0aTotal: ${formatRupiah(total)}%0aStatus: Menunggu Pembayaran%0a%0a*Informasi Pembayaran:*%0aPesanan akan diproses setelah Anda mengirimkan bukti transfer ke WhatsApp Admin.`;
          window.open(`https://wa.me/${formattedPhone}?text=${customerMessage}`, '_blank');
        }
      }
    }
  };

  const handleLoginAdmin = async (email, pass) => {
    const { data, error } = await supabase.from('admin_credentials').select('*').eq('email', email).single();
    
    if (data && data.password === pass) {
      setIsAdmin(true);
      navigate('admin-orders');
      showToast("Login Berhasil");
    } else {
      showToast("Email/Password Salah", "error");
    }
  };
  
  const handleUserLogin = async (phone) => {
      const formattedPhone = formatPhoneForWhatsApp(phone);
      const { data } = await supabase.from('customers').select('*').eq('phone', formattedPhone).single();
      if(data) {
          setUserProfile(data);
          showToast(`Selamat datang kembali, ${data.name || 'Pelanggan'}`);
      } else {
          const newUser = { 
            phone: formattedPhone, 
            name: 'Pengguna Baru', 
            email: '', 
            address: '', 
            subdistrict: '', 
            village: '', 
            full_address: '', 
            avatar_url: '' 
          };
          setUserProfile(newUser);
          const { error } = await supabase.from('customers').insert([newUser]);
          if (error) {
            // If duplicate, just set the profile
            if (error.code === '23505') {
              setUserProfile(newUser);
              showToast("Akun sudah ada");
            } else {
              handleSupabaseError(error, "Buat Akun");
            }
          } else {
            showToast("Akun baru dibuat");
          }
      }
      navigate('profile');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    navigate('home');
    showToast("Berhasil Logout");
  };

  const saveProduct = async (product) => {
    const dbProduct = mapProductToDB(product);

    if (product.id && products.find(p => p.id === product.id)) {
      const { data, error } = await supabase.from('products').update(dbProduct).eq('id', product.id).select();
      
      if (data && data.length > 0) {
         setProducts(products.map(p => p.id === product.id ? mapProductFromDB(data[0]) : p));
         showToast("Produk diperbarui");
      } else {
          handleSupabaseError(error, "Update Produk");
      }
    } else {
      const { data, error } = await supabase.from('products').insert([dbProduct]).select();
      
      if (data && data.length > 0) {
         setProducts([mapProductFromDB(data[0]), ...products]);
         showToast("Produk ditambahkan");
      } else {
          handleSupabaseError(error, "Tambah Produk");
      }
    }
    navigate('admin-inventory');
  };

  const getStoragePath = (url) => {
    if (!url) return null;
    const parts = url.split('/products/');
    if (parts.length < 2) return null;
    return parts[1];
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Yakin hapus?")) {
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete) {
          const allImages = [productToDelete.img, ...(productToDelete.images || [])].filter(Boolean);
          
          for (const url of allImages) {
              const path = getStoragePath(url);
              if (path) {
                  await supabase.storage.from('products').remove([path]);
              }
          }
      }

      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (error) {
          handleSupabaseError(error, "Hapus Produk");
      } else {
          setProducts(products.filter(p => p.id !== id));
          showToast("Produk dihapus", "error");
          navigate('admin-inventory');
      }
    }
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    const dbSettings = mapSettingsToDB(newSettings);
    
    const { error } = await supabase.from('store_settings').upsert({ ...dbSettings, id: 1 });
    
    if (error) {
        handleSupabaseError(error, "Simpan Pengaturan");
    } else {
        showToast("Pengaturan disimpan");
        navigate('admin-settings'); 
    }
  };

  // ==========================================
  // FIX: UPDATE PROFILE - HANDLE ERROR 409
  // ==========================================
  const updateProfile = async (newProfile, setSavingCallback) => {
    if (setSavingCallback) setSavingCallback(true);
    
    try {
      // Format phone number
      const formattedPhone = formatPhoneForWhatsApp(newProfile.phone);
      const profileToSave = {
        ...newProfile,
        phone: formattedPhone
      };

      // Try to insert/update
      const { error } = await supabase
        .from('customers')
        .upsert(profileToSave, {
          onConflict: 'phone',
          ignoreDuplicates: false
        });

      if (error) {
        // If 409 error, it's okay - data already exists
        if (error.code === '23505' || error.code === '409') {
          console.log('Profile already exists, updating UI only');
          setUserProfile(profileToSave);
          showToast("Profil diperbarui");
          navigate('profile');
          return;
        }
        throw error;
      }

      setUserProfile(profileToSave);
      showToast("Profil diperbarui");
      navigate('profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      handleSupabaseError(error, "Update Profil");
    } finally {
      if (setSavingCallback) setSavingCallback(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) handleSupabaseError(error, "Update Status Order");
    else showToast("Status pesanan diubah");
  };

  const cancelOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Dibatalkan' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'Dibatalkan' } : o
      ));
      
      showToast("Pesanan berhasil dibatalkan", "error");
      
      // Kembalikan stok produk
      const order = orders.find(o => o.id === orderId);
      if (order && order.items) {
        for (const item of order.items) {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const newStock = product.stock + item.qty;
            await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
          }
        }
      }
      
    } catch (error) {
      handleSupabaseError(error, "Batalkan Pesanan");
    }
  };

  if (loading) return <LoadingScreen />;

  // --- View Switcher ---
  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView settings={settings} products={products} cartCount={cart.length} navigate={navigate} addToCart={(p, v, q) => addToCart(p, v, q)} />;
      case 'product': return <ProductDetailView product={selectedProduct} addToCart={addToCart} navigate={navigate} cartCount={cart.length} saved={saved} toggleSaved={toggleSaved} />;
      case 'cart': return <CartView cart={cart} updateCartQty={updateCartQty} removeFromCart={removeFromCart} navigate={navigate} />;
      case 'checkout': return <CheckoutView cart={cart} userProfile={userProfile} setUserProfile={setUserProfile} handleCheckout={handleCheckout} navigate={navigate} settings={settings} />;
      case 'saved': return <SavedView saved={saved} navigate={navigate} />;
      case 'orders': return <OrdersView orders={orders} navigate={navigate} userPhone={userProfile.phone} onCancelOrder={cancelOrder} settings={settings} />;
      case 'order-detail': return <OrderDetailView order={selectedOrder} navigate={navigate} settings={settings} userProfile={userProfile} onCancelOrder={cancelOrder} />;
      
      case 'profile': 
        return userProfile.phone ? 
        <ProfileView userProfile={userProfile} navigate={navigate} setIsAdmin={setIsAdmin} onLogoutUser={() => { 
          setUserProfile({name:'', phone:'', email:'', address:'', subdistrict:'', village:'', full_address:''}); 
          navigate('home'); 
        }} /> : 
        <UserLogin onLogin={handleUserLogin} />;
        
      case 'edit-profile': return <EditProfileView userProfile={userProfile} onSave={updateProfile} navigate={navigate} />;
      
      // Admin
      case 'admin-login': return <AdminLogin onLogin={handleLoginAdmin} navigate={navigate} />;
      case 'admin-orders': return <AdminOrdersView orders={orders} updateOrderStatus={updateOrderStatus} formatRupiah={formatRupiah} navigate={navigate} storeSettings={settings} />;
      case 'admin-revenue-report': return <RevenueReportView orders={orders} formatRupiah={formatRupiah} navigate={navigate} />;
      case 'admin-inventory': return <AdminInventoryView products={products} formatRupiah={formatRupiah} navigate={navigate} />;
      case 'admin-add-product': return <ProductForm onSave={saveProduct} categories={settings.categories} navigate={navigate} />;
      case 'admin-edit-product': return <ProductForm initialData={editingProduct} onSave={saveProduct} onDelete={() => deleteProduct(editingProduct.id)} categories={settings.categories} navigate={navigate} />;
      case 'admin-settings': return <AdminSettingsView settings={settings} onSave={updateSettings} navigate={navigate} onLogout={handleAdminLogout} />;
      
      default: return <HomeView settings={settings} products={products} cartCount={cart.length} navigate={navigate} addToCart={()=>{}} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans antialiased overflow-hidden">
      <ToastNotification toast={toast} />
      {renderView()}
    </div>
  );
}