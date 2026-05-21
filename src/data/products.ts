export type Gender = "men" | "women" | "kids" | "unisex";
export type Occasion = "casual" | "office" | "wedding" | "party" | "travel" | "streetwear" | "college";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  category: string;
  subCategory: string;
  gender: Gender;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
  occasion: Occasion[];
  description: string;
  isNew?: boolean;
  isTrending?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
}

const brands = ["Aurum", "Noir", "Velvet & Co", "Maison Lux", "Studio Mania", "Ivory", "Atelier 21", "Onyx", "Gilded", "Rouge", "Opal", "Luna", "Halo"];
const adjectives = ["Premium", "Luxe", "Heritage", "Signature", "Classic", "Modern", "Couture", "Tailored", "Artisan", "Limited", "Royal", "Silk", "Eternal", "Velvet"];
const productNouns: Record<Gender, string[]> = {
  men: ["Shirt", "Kurta", "Jacket", "Jeans", "Hoodie", "T-Shirt", "Shoes", "Sneakers", "Watch", "Sherwani"],
  women: ["Dress", "Saree", "Lehenga", "Kurti", "Tunic", "Blouse", "Heels", "Handbag", "Sunglasses", "Gown"],
  kids: ["Set", "Kurta", "Dress", "Jumpsuit", "Sneakers", "Sandals", "Top", "Pants", "Lehenga", "Mini Kurti"],
  unisex: ["Sneakers", "Watch", "Bag", "Sunglasses", "Cap", "Scarf", "Wallet", "Bracelet", "Shoes", "Hat"],
};

const categoryNames: Record<string, string[]> = {
  "Shirts": ["Classic Shirt", "Tailored Shirt", "Linen Shirt", "Oxford Shirt", "Checked Shirt"],
  "Pants": ["Tailored Pants", "Chino Pants", "Relaxed Trousers", "Smart Pants", "Cargo Pants"],
  "Footwear": ["Sneakers", "Street Sneakers", "Classic Sneakers", "Range Sneakers"],
  "Men Accessories": ["Leather Watch", "Signature Belt", "Baseball Cap", "Gold Bracelet", "Leather Wallet"],
  "Kurtis": ["Embroidered Kurti", "Silk Kurti", "Modern Kurti", "Festive Kurti", "Casual Kurti"],
  "Sarees": ["Silk Saree", "Printed Saree", "Luxury Saree", "Party Saree", "Designer Saree"],
  "Women's Edit": ["Chic Dress", "Tailored Tunic", "Statement Blouse", "Silk Top", "Evening Dress"],
  "Accessories": ["Statement Jewelry", "Fashion Scarf", "Minimalist Bag", "Accent Belt", "Elegant Ring"],
};

const colorPalette = ["Black", "White", "Navy", "Beige", "Olive", "Burgundy", "Charcoal", "Ivory", "Camel", "Rose", "Emerald", "Gold", "Slate", "Coral"];

const folderMeta: Record<string, { category: string; subCategory: string; gender: Gender; sizes: string[]; occasions: Occasion[]; priceMin: number; priceMax: number }> = {
  "men": { category: "Men", subCategory: "Men's Essentials", gender: "men", sizes: ["S","M","L","XL","XXL"], occasions: ["casual","office","streetwear","travel"], priceMin: 1499, priceMax: 7999 },
  "women": { category: "Women", subCategory: "Women’s Edit", gender: "women", sizes: ["XS","S","M","L","XL"], occasions: ["party","wedding","office","travel"], priceMin: 1799, priceMax: 10999 },
  "kurtis": { category: "Ethnic", subCategory: "Kurtis", gender: "women", sizes: ["XS","S","M","L","XL"], occasions: ["casual","office","wedding","party"], priceMin: 1599, priceMax: 5999 },
  "saree": { category: "Ethnic", subCategory: "Sarees", gender: "women", sizes: ["Free"], occasions: ["wedding","party"], priceMin: 2999, priceMax: 24999 },
  "Men kurta": { category: "Men", subCategory: "Kurtas", gender: "men", sizes: ["S","M","L","XL","XXL"], occasions: ["wedding","party","casual"], priceMin: 1999, priceMax: 8999 },
  "footwear": { category: "Footwear", subCategory: "Footwear", gender: "unisex", sizes: ["6","7","8","9","10","11"], occasions: ["casual","streetwear","office","party"], priceMin: 1499, priceMax: 14999 },
  "shirts": { category: "Men", subCategory: "Shirts", gender: "men", sizes: ["S","M","L","XL","XXL"], occasions: ["casual","office","party","streetwear"], priceMin: 999, priceMax: 5999 },
  "pants": { category: "Men", subCategory: "Pants", gender: "men", sizes: ["S","M","L","XL","XXL"], occasions: ["casual","office","travel"], priceMin: 1199, priceMax: 6999 },
  "men accessories": { category: "Accessories", subCategory: "Men Accessories", gender: "men", sizes: ["Free"], occasions: ["casual","office","party"], priceMin: 499, priceMax: 9999 },
  "kids boys": { category: "Kids", subCategory: "Boys", gender: "kids", sizes: ["2-3Y","4-5Y","6-7Y","8-9Y","10-12Y"], occasions: ["casual","party","wedding"], priceMin: 899, priceMax: 4999 },
  "kids girls": { category: "Kids", subCategory: "Girls", gender: "kids", sizes: ["2-3Y","4-5Y","6-7Y","8-9Y","10-12Y"], occasions: ["casual","party","wedding"], priceMin: 999, priceMax: 5999 },
};

const imageModules = import.meta.glob<{ default: string }>("../../images/**/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" });

const groupedImages = Object.entries(imageModules).reduce((acc, [path, url]) => {
  const normalized = path.replace(/\\/g, "/");
  const relative = normalized.replace(/.*\/images\//, "");
  const [folder] = relative.split("/");
  if (!folderMeta[folder]) return acc;
  acc[folder] = acc[folder] ?? [];
  acc[folder].push(url);
  return acc;
}, {} as Record<string, string[]>);

function rand<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function pickImages(images: string[], index: number) {
  if (!images.length) return [];
  const rotated = images.slice(index).concat(images.slice(0, index));
  return Array.from(new Set(rotated.slice(0, 4)));
}

function buildName(seed: number, meta: { gender: Gender; subCategory: string }) {
  const categoryOptions = categoryNames[meta.subCategory];
  if (categoryOptions && categoryOptions.length) {
    return `${rand(adjectives, seed)} ${rand(categoryOptions, seed + 7)}`;
  }
  const nouns = productNouns[meta.gender] ?? productNouns.unisex;
  return `${rand(adjectives, seed)} ${rand(nouns, seed + 7)}`;
}

export const products: Product[] = (() => {
  const list: Product[] = [];
  let nextId = 1;
  const usedImage = new Set<string>();

  for (const [folder, images] of Object.entries(groupedImages)) {
    const meta = folderMeta[folder];
    if (!meta) continue;

    const sortedImages = [...images].sort();

    sortedImages.forEach((image, index) => {
      const seed = nextId * 13 + index * 7;
      const price = Math.max(
        299,
        Math.round((meta.priceMin + ((seed % 100) / 100) * (meta.priceMax - meta.priceMin)) / 50) * 50 + 49,
      );
      const originalPrice = Math.round(price * (1 + 0.18 + ((seed % 15) / 100)) / 50) * 50 + 49;
      const colors = [
        colorPalette[seed % colorPalette.length],
        colorPalette[(seed + 4) % colorPalette.length],
        colorPalette[(seed + 8) % colorPalette.length],
      ];
      const productImages = pickImages(sortedImages, index).filter(Boolean);
      // Skip if primary image already used to avoid duplicates across folders
      const primary = productImages.length ? productImages[0] : image;
      if (usedImage.has(primary)) return; 
      usedImage.add(primary);
      const name = buildName(seed, meta);
      const isSale = originalPrice - price > price * 0.15;

      list.push({
        id: String(nextId),
        name,
        brand: rand(brands, seed),
        price,
        originalPrice,
        category: meta.category,
        subCategory: meta.subCategory,
        gender: meta.gender,
        colors,
        sizes: meta.sizes,
        rating: Math.min(5, 3.8 + ((seed % 15) / 10)),
        reviews: 20 + (seed % 2500),
        images: productImages.length ? productImages : [image],
        tags: [meta.category.toLowerCase(), meta.subCategory.toLowerCase(), meta.gender, ...meta.occasions, colors[0].toLowerCase()],
        occasion: meta.occasions,
        description: `A stylish ${meta.subCategory.toLowerCase()} designed for ${meta.occasions.slice(0, 2).join(" and ")}. Soft textures, bold details, and versatile styling for every wardrobe.`,
        isNew: index % 4 === 0,
        isTrending: index % 3 === 0,
        isFeatured: index % 5 === 0,
        isSale,
      });
      nextId += 1;
    });
  }

  return list;
})();

export const categories = Object.values(
  products.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = {
        name: p.category,
        image: p.images[0],
        href: `/shop?category=${encodeURIComponent(p.category)}`,
      };
    }
    return acc;
  }, {} as Record<string, { name: string; image: string; href: string }>),
);

// Restore original homepage banner slides (use the original images, do NOT auto-generate)
export const heroSlides = [
  {
    title: "Wear Your Story",
    subtitle: "New Season Collection",
    cta: "Shop Now",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    href: "/shop",
  },
  {
    title: "Timeless Luxury",
    subtitle: "Shopee @ 2026",
    cta: "Explore Collection",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
    href: "/shop?category=Women",
  },
  {
    title: "Define The Edge",
    subtitle: "Men's Signature Line",
    cta: "Discover Now",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1920&q=80",
    href: "/shop?category=Men",
  },
];

export const reviews = [
  { name: "Priya S.", text: "Absolutely love the quality! The AI recommendations helped me build the perfect outfit for my event.", rating: 5 },
  { name: "Rahul M.", text: "Premium quality and lightning-fast delivery. The packaging was so luxurious I felt like royalty!", rating: 5 },
  { name: "Aisha K.", text: "The AI stylist feature is a game-changer. I discovered combinations I would never have thought of!", rating: 5 },
  { name: "Arjun V.", text: "Best ecommerce experience hands down. The product photography is stunning and quality matches.", rating: 5 },
];

export function getRelatedProducts(p: Product, count = 8) {
  return products
    .filter((x) => x.id !== p.id && (x.category === p.category || x.gender === p.gender))
    .slice(0, count);
}

export function getOutfitForItem(p: Product): Product[] {
  const seed = parseInt(p.id, 10) || 1;
  
  // Deterministic picker
  const pickFrom = (pool: Product[], index: number): Product | null => {
    if (!pool.length) return null;
    return pool[(seed * 13 + index * 17) % pool.length];
  };

  // Helper to get all products matching criteria
  const getBySubCategory = (subCat: string, gender?: Gender) => 
    products.filter((x) => x.id !== p.id && x.subCategory === subCat && (!gender || x.gender === gender));

  const getByGender = (g: Gender) => 
    products.filter((x) => x.id !== p.id && x.gender === g);

  const getMenShoes = () => 
    products.filter((x) => x.id !== p.id && x.category === "Footwear" && (x.gender === "men" || x.gender === "unisex"));

  const getMenAccessories = () => 
    products.filter((x) => x.id !== p.id && x.category === "Accessories" && x.gender === "men");

  const getWomenLeggings = () => 
    products.filter((x) => x.id !== p.id && (x.subCategory === "Pants" || /legging|salwar|pant/i.test(x.subCategory)) && x.gender === "women");

  const getWomenSandals = () => 
    products.filter((x) => x.id !== p.id && x.category === "Footwear" && (x.gender === "women" || x.gender === "unisex"));

  const getWomenEarrings = () => 
    products.filter((x) => x.id !== p.id && x.category === "Accessories" && x.gender === "women" && /earring/i.test(x.name + " " + x.description));

  const getWomenAccessories = () => 
    products.filter((x) => x.id !== p.id && x.category === "Accessories" && x.gender === "women");

  const getBlouse = () => 
    products.filter((x) => x.id !== p.id && (x.subCategory === "Blouse" || /blouse/i.test(x.name)) && x.gender === "women");

  const getWomenJewelry = () => 
    products.filter((x) => x.id !== p.id && x.category === "Accessories" && x.gender === "women" && /jewelry|jewel|necklace|bangle/i.test(x.name));

  const getWomenJeans = () => 
    products.filter((x) => x.id !== p.id && (x.subCategory === "Pants" || /jean|denim/i.test(x.subCategory)) && x.gender === "women");

  const getWomenHeels = () => 
    products.filter((x) => x.id !== p.id && x.category === "Footwear" && (x.gender === "women" || x.gender === "unisex"));

  const out: Product[] = [];

  // MEN MATCHING RULES
  if (p.gender === "men") {
    // T-SHIRT → jeans + sneakers + cap
    if (/t-shirt|tshirt/i.test(p.subCategory) || /t-shirt|tshirt/i.test(p.name)) {
      const pants = pickFrom(getBySubCategory("Pants", "men"), 0);
      const shoes = pickFrom(getMenShoes(), 1);
      const acc = pickFrom(getMenAccessories(), 2);
      if (pants) out.push(pants);
      if (shoes) out.push(shoes);
      if (acc) out.push(acc);
      return out;
    }

    // SHIRT → pants + shoes + watch/belt
    if (/shirt/i.test(p.subCategory) || /shirt/i.test(p.name)) {
      const pants = pickFrom(getBySubCategory("Pants", "men"), 0);
      const shoes = pickFrom(getMenShoes(), 1);
      const acc = pickFrom(getMenAccessories(), 2);
      if (pants) out.push(pants);
      if (shoes) out.push(shoes);
      if (acc) out.push(acc);
      return out;
    }

    // PANTS → shirt + shoes
    if (/pants/i.test(p.subCategory)) {
      const shirt = pickFrom(getBySubCategory("Shirts", "men"), 0);
      const shoes = pickFrom(getMenShoes(), 1);
      if (shirt) out.push(shirt);
      if (shoes) out.push(shoes);
      return out;
    }

    // KURTA → shirt + shoes
    if (/kurta/i.test(p.subCategory)) {
      const shirt = pickFrom(getBySubCategory("Shirts", "men"), 0);
      const shoes = pickFrom(getMenShoes(), 1);
      if (shirt) out.push(shirt);
      if (shoes) out.push(shoes);
      return out;
    }

    // FOOTWEAR → casual outfit (shirt + pants)
    if (p.category === "Footwear") {
      const shirt = pickFrom(getBySubCategory("Shirts", "men"), 0);
      const pants = pickFrom(getBySubCategory("Pants", "men"), 1);
      if (shirt) out.push(shirt);
      if (pants) out.push(pants);
      return out;
    }

    // MEN ACCESSORIES → casual outfit
    if (/accessories/i.test(p.subCategory) && p.gender === "men") {
      const shirt = pickFrom(getBySubCategory("Shirts", "men"), 0);
      const pants = pickFrom(getBySubCategory("Pants", "men"), 1);
      if (shirt) out.push(shirt);
      if (pants) out.push(pants);
      return out;
    }
  }

  // WOMEN MATCHING RULES
  if (p.gender === "women") {
    // KURTI → leggings + sandals + earrings
    if (/kurti/i.test(p.subCategory)) {
      const legging = pickFrom(getWomenLeggings(), 0);
      const sandal = pickFrom(getWomenSandals(), 1);
      const earring = pickFrom(getWomenEarrings(), 2) || pickFrom(getWomenAccessories(), 2);
      if (legging) out.push(legging);
      if (sandal) out.push(sandal);
      if (earring) out.push(earring);
      return out;
    }

    // SAREE → blouse + jewelry + heels
    if (/saree/i.test(p.subCategory)) {
      const blouse = pickFrom(getBlouse(), 0) || pickFrom(getWomenAccessories(), 0);
      const jewelry = pickFrom(getWomenJewelry(), 1);
      const heels = pickFrom(getWomenHeels(), 2);
      if (blouse) out.push(blouse);
      if (jewelry) out.push(jewelry);
      if (heels) out.push(heels);
      return out;
    }

    // TOPS/DRESS → jeans + handbag/shoes
    if (/top|dress|t-shirt|blouse|tunic/i.test(p.subCategory)) {
      const jeans = pickFrom(getWomenJeans(), 0);
      const shoes = pickFrom(getWomenHeels(), 1);
      if (jeans) out.push(jeans);
      if (shoes) out.push(shoes);
      return out;
    }

    // FOOTWEAR → casual outfit
    if (p.category === "Footwear") {
      const top = pickFrom(getByGender("women").filter((x) => /top|dress|shirt|blouse/i.test(x.subCategory)), 0);
      const bottom = pickFrom(getWomenJeans(), 1);
      if (top) out.push(top);
      if (bottom) out.push(bottom);
      return out;
    }

    // WOMEN ACCESSORIES → top + bottom
    if (/accessories/i.test(p.subCategory) && p.gender === "women") {
      const top = pickFrom(getByGender("women").filter((x) => /top|dress|shirt|blouse/i.test(x.subCategory)), 0);
      const bottom = pickFrom(getWomenJeans(), 1);
      if (top) out.push(top);
      if (bottom) out.push(bottom);
      return out;
    }
  }

  // Fallback: return empty (no match)
  return [];
}
