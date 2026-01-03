// --- HELPER FUNCTIONS ---
export function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
}

export function areVariantsEqual(v1, v2) {
  if (!v1 && !v2) return true;
  if (!v1 || !v2) return false;
  const keys1 = Object.keys(v1);
  const keys2 = Object.keys(v2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => v1[key] === v2[key]);
}

export function formatVariantString(variants) {
  if (!variants || typeof variants !== 'object' || Object.keys(variants).length === 0) return '';
  return `(${Object.values(variants).join(', ')})`;
}

// --- DATA MAPPERS ---
export const mapProductFromDB = (p) => {
  let parsedVariants = [];
  let parsedVariantImages = {};
  let parsedImages = [];
  let parsedVariantPrices = {};

  if (p.variants) {
    if (Array.isArray(p.variants)) parsedVariants = p.variants;
    else if (typeof p.variants === 'string') {
      try { parsedVariants = JSON.parse(p.variants); } catch (e) { parsedVariants = []; }
    } else if (typeof p.variants === 'object') {
      parsedVariants = Object.values(p.variants); 
    }
  }

  if (p.variant_images) {
    if (typeof p.variant_images === 'object' && p.variant_images !== null) parsedVariantImages = p.variant_images;
    else if (typeof p.variant_images === 'string') {
      try { parsedVariantImages = JSON.parse(p.variant_images); } catch { parsedVariantImages = {}; }
    }
  }

  if (p.variant_prices) {
    if (typeof p.variant_prices === 'object' && p.variant_prices !== null) {
      parsedVariantPrices = p.variant_prices;
    } else if (typeof p.variant_prices === 'string') {
      try { parsedVariantPrices = JSON.parse(p.variant_prices); } catch { parsedVariantPrices = {}; }
    }
  }

  if (p.images) {
      if (Array.isArray(p.images)) parsedImages = p.images;
      else if (typeof p.images === 'string') { try { parsedImages = JSON.parse(p.images); } catch { parsedImages = []; } }
  }

  return {
    id: p.id,
    name: p.name || 'Produk Tanpa Nama',
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    category: p.category || 'Umum',
    description: p.description || '', 
    img: p.img || '',
    images: parsedImages,
    variants: Array.isArray(parsedVariants) ? parsedVariants : [], 
    variantImages: parsedVariantImages,
    variantPrices: parsedVariantPrices
  };
};

export const mapProductToDB = (p) => ({
  name: p.name,
  price: p.price,
  stock: p.stock,
  category: p.category,
  description: p.description || p.desc,
  img: p.img,
  images: p.images || [],
  variants: p.variants || [], 
  variant_images: p.variantImages || {},
  variant_prices: p.variantPrices || {}
});

export const mapSettingsFromDB = (s) => ({
  storeName: s?.store_name || "BM Store",
  whatsapp: s?.whatsapp || "",
  address: s?.address || "",
  heroImage: s?.hero_image || "",
  promoText: s?.promo_text || "",
  categories: Array.isArray(s?.categories) ? s.categories : ["Umum"],
  theme: s?.theme || 'light',
  currency: s?.currency || 'IDR',
  paymentMethods: Array.isArray(s?.payment_methods) ? s.payment_methods : ['COD', 'Ambil di Kantor'],
  bankAccounts: Array.isArray(s?.bank_accounts) ? s.bank_accounts : []
});

export const mapSettingsToDB = (s) => ({
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

export const mapOrderFromDB = (o) => {
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

export const INITIAL_DB = {
  settings: {
    storeName: "BM Store Official",
    whatsapp: "",
    address: "",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    promoText: "Selamat Datang",
    categories: ["Fesyen", "Elektronik"],
    theme: 'light',
    currency: 'IDR',
    paymentMethods: ['COD', 'Ambil di Kantor'],
    bankAccounts: [
      { bank: 'BCA', number: '1234567890', name: 'Budi Santoso' },
      { bank: 'Mandiri', number: '0987654321', name: 'Budi Santoso' }
    ]
  },
  products: [],
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