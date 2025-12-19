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
    variantImages: parsedVariantImages
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
  variant_images: p.variantImages || {}
});

export const mapSettingsFromDB = (s) => ({
  storeName: s?.store_name || "BM Store",
  whatsapp: s?.whatsapp || "",
  address: s?.address || "",
  heroImage: s?.hero_image || "",
  promoText: s?.promo_text || "",
  categories: Array.isArray(s?.categories) ? s.categories : ["Umum"],
  theme: s?.theme || 'light',
});

export const mapSettingsToDB = (s) => ({
  store_name: s.storeName,
  whatsapp: s.whatsapp,
  address: s.address,
  hero_image: s.heroImage,
  promo_text: s.promo_text,
  categories: s.categories,
  theme: s.theme,
});

export const INITIAL_DB = {
  settings: {
    storeName: "BM Store Official",
    whatsapp: "",
    address: "",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    promoText: "Selamat Datang",
    categories: ["Fesyen", "Elektronik"],
    theme: 'light'
  },
  products: [],
  user: { name: "", email: "", phone: "", address: "", avatar_url: "" }
};