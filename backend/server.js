import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = process.env.PORT || 4000;
const API_BASE = process.env.API_BASE || `http://localhost:${PORT}`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const uploadDir = path.join(__dirname, "..", "public", "uploads");
await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 70);
    cb(null, `${Date.now()}-${safeName}${ext.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Please upload a valid image file."));
      return;
    }
    cb(null, true);
  },
});

const geminiModel = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: GEMINI_MODEL })
  : null;

const outfitCombos = {
  men: {
    casual: [
      {
        title: "Oversized tshirt + cargos + sneakers",
        category: "Casual",
        items: ["Oversized tshirt", "Cargo pants", "White sneakers"],
        colors: ["black", "olive", "white"],
        imageQuery: "men oversized tshirt cargos sneakers outfit",
      },
      {
        title: "Hoodie + joggers + chain",
        category: "Stylish",
        items: ["Hoodie", "Joggers", "Chain"],
        colors: ["charcoal", "slate", "silver"],
        imageQuery: "men hoodie joggers chain outfit",
      },
      {
        title: "Denim jacket + tee + boots",
        category: "Stylish",
        items: ["Denim jacket", "Graphic tee", "Leather boots"],
        colors: ["blue", "white", "brown"],
        imageQuery: "men denim jacket tee boots outfit",
      },
    ],
    formal: [
      {
        title: "Black formal shirt + beige pant + silver watch",
        category: "Formal",
        items: ["Black formal shirt", "Beige pants", "Silver watch"],
        colors: ["black", "beige", "silver"],
        imageQuery: "men black formal shirt beige pant silver watch outfit",
      },
      {
        title: "Navy blazer + white shirt + loafers",
        category: "Formal",
        items: ["Navy blazer", "White shirt", "Leather loafers"],
        colors: ["navy", "white", "brown"],
        imageQuery: "men navy blazer white shirt loafers outfit",
      },
      {
        title: "Charcoal suit + black shoes + watch",
        category: "Formal",
        items: ["Charcoal suit", "Black dress shoes", "Classic watch"],
        colors: ["charcoal", "black", "silver"],
        imageQuery: "men charcoal suit black shoes watch outfit",
      },
    ],
    stylish: [
      {
        title: "Leather jacket + black jeans + chain",
        category: "Stylish",
        items: ["Leather jacket", "Black jeans", "Chain"],
        colors: ["black", "grey", "silver"],
        imageQuery: "men leather jacket black jeans chain outfit",
      },
      {
        title: "Bomber jacket + white tee + sneakers",
        category: "Stylish",
        items: ["Bomber jacket", "White tee", "Sneakers"],
        colors: ["olive", "white", "black"],
        imageQuery: "men bomber jacket white tee sneakers outfit",
      },
      {
        title: "Shirt + chinos + dress watch",
        category: "Stylish",
        items: ["Slim shirt", "Chinos", "Dress watch"],
        colors: ["brown", "cream", "gold"],
        imageQuery: "men shirt chinos dress watch outfit",
      },
    ],
    traditional: [
      {
        title: "Kurta + churidar + sandals",
        category: "Traditional",
        items: ["Kurta", "Churidar", "Sandals"],
        colors: ["cream", "maroon", "gold"],
        imageQuery: "men kurta churidar sandals outfit",
      },
      {
        title: "Nehru jacket + pants + loafers",
        category: "Traditional",
        items: ["Nehru jacket", "Classic pants", "Loafers"],
        colors: ["navy", "cream", "brown"],
        imageQuery: "men nehru jacket pants loafers outfit",
      },
      {
        title: "Sherwani + mojari + watch",
        category: "Traditional",
        items: ["Sherwani", "Mojari shoes", "Watch"],
        colors: ["beige", "gold", "maroon"],
        imageQuery: "men sherwani mojari watch outfit",
      },
    ],
  },
  women: {
    casual: [
      {
        title: "Kurti + leggings + sandals",
        category: "Casual",
        items: ["Kurti", "Leggings", "Sandals"],
        colors: ["peach", "navy", "cream"],
        imageQuery: "women kurti leggings sandals outfit",
      },
      {
        title: "Denim jacket + top + jeans",
        category: "Casual",
        items: ["Denim jacket", "Casual top", "Jeans"],
        colors: ["blue", "white", "black"],
        imageQuery: "women denim jacket top jeans outfit",
      },
      {
        title: "Shirt dress + sneakers + tote",
        category: "Casual",
        items: ["Shirt dress", "Sneakers", "Tote bag"],
        colors: ["white", "pink", "tan"],
        imageQuery: "women shirt dress sneakers tote outfit",
      },
    ],
    formal: [
      {
        title: "Pink saree + silver jewelry",
        category: "Formal",
        items: ["Pink saree", "Silver jewelry"],
        colors: ["pink", "silver", "white"],
        imageQuery: "women pink saree silver jewelry outfit",
      },
      {
        title: "Tailored blouse + pencil skirt + heels",
        category: "Formal",
        items: ["Tailored blouse", "Pencil skirt", "Heels"],
        colors: ["black", "white", "nude"],
        imageQuery: "women blouse pencil skirt heels outfit",
      },
      {
        title: "Silk kurti + palazzo + heels",
        category: "Formal",
        items: ["Silk kurti", "Palazzo pants", "Heels"],
        colors: ["teal", "gold", "cream"],
        imageQuery: "women silk kurti palazzo heels outfit",
      },
    ],
    stylish: [
      {
        title: "Lehenga + heels + handbag",
        category: "Stylish",
        items: ["Lehenga", "Heels", "Handbag"],
        colors: ["maroon", "gold", "ivory"],
        imageQuery: "women lehenga heels handbag outfit",
      },
      {
        title: "Saree + silver jewelry",
        category: "Stylish",
        items: ["Saree", "Silver jewelry"],
        colors: ["blue", "silver", "white"],
        imageQuery: "women saree silver jewelry outfit",
      },
      {
        title: "Off-shoulder dress + clutch",
        category: "Stylish",
        items: ["Off-shoulder dress", "Clutch"],
        colors: ["black", "red", "gold"],
        imageQuery: "women off shoulder dress clutch outfit",
      },
    ],
    traditional: [
      {
        title: "Saree + gold jewelry",
        category: "Traditional",
        items: ["Saree", "Gold jewelry"],
        colors: ["red", "gold", "cream"],
        imageQuery: "women saree gold jewelry outfit",
      },
      {
        title: "Lehenga + heels + handbag",
        category: "Traditional",
        items: ["Lehenga", "Heels", "Handbag"],
        colors: ["pink", "gold", "cream"],
        imageQuery: "women lehenga heels handbag outfit",
      },
      {
        title: "Embroidered kurti + palazzo + juttis",
        category: "Traditional",
        items: ["Embroidered kurti", "Palazzo pants", "Juttis"],
        colors: ["green", "gold", "beige"],
        imageQuery: "women embroidered kurti palazzo juttis outfit",
      },
    ],
  },
  kids: {
    casual: [
      {
        title: "Kids tshirt + jeans + sneakers",
        category: "Casual",
        items: ["Kids tshirt", "Jeans", "Sneakers"],
        colors: ["blue", "yellow", "white"],
        imageQuery: "kids tshirt jeans sneakers outfit",
      },
      {
        title: "Frock + sandals",
        category: "Casual",
        items: ["Frock", "Sandals"],
        colors: ["pink", "white", "yellow"],
        imageQuery: "kids frock sandals outfit",
      },
      {
        title: "Party top + pants + shoes",
        category: "Casual",
        items: ["Party top", "Pants", "Shoes"],
        colors: ["red", "black", "silver"],
        imageQuery: "kids party top pants shoes outfit",
      },
    ],
    formal: [
      {
        title: "Party wear dress + shoes",
        category: "Formal",
        items: ["Party dress", "Dress shoes"],
        colors: ["purple", "gold", "white"],
        imageQuery: "kids party wear dress shoes outfit",
      },
      {
        title: "Children suit + formal shoes",
        category: "Formal",
        items: ["Children suit", "Formal shoes"],
        colors: ["navy", "white", "black"],
        imageQuery: "kids suit formal shoes outfit",
      },
      {
        title: "Ethnic set + sandals",
        category: "Formal",
        items: ["Ethnic set", "Sandals"],
        colors: ["cream", "blue", "gold"],
        imageQuery: "kids ethnic set sandals outfit",
      },
    ],
    stylish: [
      {
        title: "Cool tee + jeans + sneakers",
        category: "Stylish",
        items: ["Cool tee", "Jeans", "Sneakers"],
        colors: ["black", "red", "white"],
        imageQuery: "kids cool tee jeans sneakers outfit",
      },
      {
        title: "Sparkle frock + flats",
        category: "Stylish",
        items: ["Sparkle frock", "Flats"],
        colors: ["pink", "silver", "white"],
        imageQuery: "kids sparkle frock flats outfit",
      },
      {
        title: "Party top + skirt + shoes",
        category: "Stylish",
        items: ["Party top", "Skirt", "Shoes"],
        colors: ["purple", "silver", "pink"],
        imageQuery: "kids party top skirt shoes outfit",
      },
    ],
    traditional: [
      {
        title: "Kids kurta + pajama + sandals",
        category: "Traditional",
        items: ["Kids kurta", "Pajama", "Sandals"],
        colors: ["cream", "green", "gold"],
        imageQuery: "kids kurta pajama sandals outfit",
      },
      {
        title: "Lehenga set + juttis",
        category: "Traditional",
        items: ["Lehenga set", "Juttis"],
        colors: ["pink", "gold", "cream"],
        imageQuery: "kids lehenga set juttis outfit",
      },
      {
        title: "Ethnic dress + sandals",
        category: "Traditional",
        items: ["Ethnic dress", "Sandals"],
        colors: ["red", "cream", "gold"],
        imageQuery: "kids ethnic dress sandals outfit",
      },
    ],
  },
};

function normalizeGroup(value) {
  const text = String(value || "").toLowerCase();
  if (/kids|child|children|toddler|baby/.test(text)) return "kids";
  if (/women|female|girl|lady/.test(text)) return "women";
  if (/men|male|guy|man/.test(text)) return "men";
  return "men";
}

function normalizeStyle(value) {
  const text = String(value || "").toLowerCase();
  if (/formal/.test(text)) return "formal";
  if (/traditional/.test(text)) return "traditional";
  if (/stylish|style|fashion|modern|trendy/.test(text)) return "stylish";
  return "casual";
}

function normalizeGender(value) {
  const text = String(value || "").toLowerCase();
  if (/female|woman|girl|lady/.test(text)) return "female";
  if (/male|man|guy/.test(text)) return "male";
  if (/kids|child|children|toddler|baby/.test(text)) return "kid";
  return "unknown";
}

function parseJsonResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function buildPrompt() {
  return `You are a fashion stylist for a minimal AI outfit recommender. Analyze the image and return ONLY valid JSON with the following keys:
{
  "gender": "male" or "female" or "kid",
  "ageGroup": "men" or "women" or "kids",
  "style": "casual" or "formal" or "stylish" or "traditional"
}

Rules:
- Detect the face gender and age group only.
- Detect the dominant personality style only: casual, formal, stylish, or traditional.
- Do not return outfits, products, shopping, or checkout text.
- Do not include markdown, explanation, or any extra text.
- Do not return image captions or non-JSON content.`
}

async function fetchPexelsImage(query, index) {
  if (!PEXELS_API_KEY) return null;

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "6");
  url.searchParams.set("orientation", "portrait");

  const response = await fetch(url.href, { headers: { Authorization: PEXELS_API_KEY } });
  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  const photo = data?.photos?.[index % (data.photos?.length || 1)];
  return photo?.src?.large2x || photo?.src?.large || photo?.src?.portrait || null;
}

function unsplashFallback(query, index) {
  const signature = [...`${query}-${index}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `https://source.unsplash.com/900x1200/?${encodeURIComponent(query)}&sig=${signature}`;
}

async function tryUnsplashImage(query, index) {
  const url = unsplashFallback(query, index);
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) return url;
  } catch {
    // ignore and fallback
  }
  return null;
}

function placeholderImageUrl(label) {
  const safeLabel = String(label || "Outfit").replace(/</g, "").replace(/>/g, "");
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"900\" height=\"1200\"><rect width=\"100%\" height=\"100%\" fill=\"#111827\"/><text x=\"50%\" y=\"45%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#f8fafc\" font-size=\"48\" font-family=\"Arial, Helvetica, sans-serif\">${safeLabel}</text><text x=\"50%\" y=\"55%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#9ca3af\" font-size=\"28\" font-family=\"Arial, Helvetica, sans-serif\">Outfit preview</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function attachImages(outfits) {
  return Promise.all(
    outfits.map(async (outfit, index) => ({
      ...outfit,
      imageUrl:
        (await fetchPexelsImage(outfit.imageQuery, index)) ||
        (await tryUnsplashImage(outfit.imageQuery, index)) ||
        placeholderImageUrl(outfit.title),
      imageAlt: outfit.title,
    })),
  );
}

function getOutfitCombos(ageGroup, style) {
  const choices = outfitCombos[ageGroup]?.[style] || outfitCombos[ageGroup]?.casual || outfitCombos.men.casual;
  return choices.slice(0, 3).map((outfit, index) => ({
    id: `${ageGroup}-${style}-${index}-${Date.now()}`,
    ...outfit,
  }));
}

function buildFallbackAnalysis(fileName) {
  const lower = String(fileName || "").toLowerCase();
  const gender = /kids|child|children|toddler|baby/.test(lower)
    ? "kid"
    : /women|female|girl|lady/.test(lower)
    ? "female"
    : /men|male|guy|man/.test(lower)
    ? "male"
    : "male";
  const ageGroup = gender === "female" ? "women" : gender === "kid" ? "kids" : "men";
  const style = /formal|suit|business/.test(lower)
    ? "formal"
    : /traditional|saree|lehenga|kurti|ethnic/.test(lower)
    ? "traditional"
    : /stylish|modern|trendy|fashion|glam/.test(lower)
    ? "stylish"
    : "casual";

  return {
    gender,
    ageGroup,
    look: style,
    outfits: getOutfitCombos(ageGroup, style),
  };
}

async function analyzeGemini(file) {
  if (!geminiModel) {
    throw new Error("Gemini API key is missing or invalid.");
  }

  const buffer = await fs.readFile(file.path);
  const result = await geminiModel.generateContent([
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.mimetype || "image/jpeg",
      },
    },
    { text: buildPrompt() },
  ]);

  const text = await result.response.text();
  const parsed = parseJsonResponse(String(text));
  if (!parsed) {
    throw new Error("Gemini returned invalid JSON.");
  }

  const gender = normalizeGender(parsed.gender);
  const ageGroup = normalizeGroup(parsed.ageGroup || parsed.gender);
  const style = normalizeStyle(parsed.style || parsed.look || "casual");

  return {
    gender,
    ageGroup,
    look: style,
    outfits: getOutfitCombos(ageGroup, style),
  };
}

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Please upload an image file." });
  }

  let analysis;

  try {
    analysis = await analyzeGemini(req.file);
  } catch (error) {
    analysis = buildFallbackAnalysis(req.file.originalname || req.file.filename || "photo");
  }

  try {
    const outfitsWithImages = await attachImages(analysis.outfits.slice(0, 4));
    return res.json({
      success: true,
      imageUrl: `${API_BASE}/uploads/${encodeURIComponent(req.file.filename)}`,
      ...analysis,
      outfits: outfitsWithImages,
    });
  } catch (error) {
    const fallback = buildFallbackAnalysis(req.file.originalname || req.file.filename || "photo");
    const outfitsWithImages = await attachImages(fallback.outfits);
    return res.json({
      success: true,
      imageUrl: `${API_BASE}/uploads/${encodeURIComponent(req.file.filename)}`,
      ...fallback,
      outfits: outfitsWithImages,
    });
  }
});

app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", gemini: Boolean(geminiModel), pexels: Boolean(PEXELS_API_KEY) });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, error: error.message || "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`AI Outfit API running on http://localhost:${PORT}`);
});
