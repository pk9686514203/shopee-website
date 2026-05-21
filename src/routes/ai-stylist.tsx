import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, type ChangeEvent, type DragEvent } from "react";
import { Layout } from "@/components/Layout";
import { UploadCloud, Loader2, Sparkles, X } from "lucide-react";

declare module "@tensorflow/tfjs";
declare module "@tensorflow-models/mobilenet" {
  export function load(): Promise<{
    classify(image: HTMLImageElement): Promise<Array<{ className: string }>>;
  }>;
}

import "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

type Outfit = {
  id: string;
  title: string;
  category: string;
  items: string[];
  accessories: string[];
  colors: string[];
  imageUrl: string;
  imageAlt: string;
  rating: number;
  matchPercentage: number;
};

type AnalysisResult = {
  gender: string;
  ageGroup: "men" | "women" | "kids";
  look: string;
  outfits: Outfit[];
  imageUrl: string;
};

const menImages = Array.from({ length: 12 }, (_, index) => `/mens/men${index + 1}.jpeg`);
const womenImages = Array.from({ length: 10 }, (_, index) => `/women/women${index + 1}.jpeg`);
const kidsImages = Array.from({ length: 20 }, (_, index) => `/kids/kids${index + 1}.jpeg`);
const accessoryImages = Array.from({ length: 20 }, (_, index) => `/accessories/accessory${index + 1}.jpeg`);

const safeMenImages = menImages;
const safeWomenImages = womenImages;
const safeKidsImages = kidsImages;

let cachedMobilenetModel: Promise<{ classify(image: HTMLImageElement): Promise<Array<{ className: string }>> }> | null = null;
const getMobilenetModel = () => {
  if (!cachedMobilenetModel) {
    cachedMobilenetModel = mobilenet.load();
  }
  return cachedMobilenetModel;
};

let cachedCocoSsdModel: Promise<{
  detect(image: HTMLImageElement): Promise<Array<{ class: string; score: number }>>;
}> | null = null;
const getCocoSsdModel = () => {
  if (!cachedCocoSsdModel) {
    cachedCocoSsdModel = cocoSsd.load();
  }
  return cachedCocoSsdModel;
};

const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const buildOutfitRecommendations = (ageGroup: "men" | "women" | "kids", look: string): Outfit[] => {
  const templates: Record<string, Array<Omit<Outfit, "id" | "imageUrl" | "imageAlt" | "rating" | "matchPercentage">>> = {
    men: [
      {
        title: "Formal shirt & trousers",
        category: "Formal",
        items: ["Formal shirt", "Trousers", "Leather watch"],
        accessories: ["Loafers", "Leather belt"],
        colors: ["black", "navy", "silver"],
      },
      {
        title: "Modern cotton shirt set",
        category: "Formal",
        items: ["Button-down shirt", "Slim trousers", "Minimal watch"],
        accessories: ["Leather loafers", "Slim belt"],
        colors: ["white", "grey", "brown"],
      },
      {
        title: "T-shirt & jeans combo",
        category: "Casual",
        items: ["T-shirt", "Jeans", "Sneakers"],
        accessories: ["Cap", "Bracelet"],
        colors: ["blue", "white", "black"],
      },
      {
        title: "Oversized tee with cargos",
        category: "Streetwear",
        items: ["Oversized T-shirt", "Cargos", "Sneakers"],
        accessories: ["Chain", "Cap"],
        colors: ["olive", "black", "white"],
      },
      {
        title: "Casual hoodie and trainers",
        category: "Casual",
        items: ["Hoodie", "Joggers", "Sneakers"],
        accessories: ["Watch", "Backpack"],
        colors: ["grey", "black", "white"],
      },
    ],
    women: [
      {
        title: "Saree & statement jewelry",
        category: "Traditional",
        items: ["Saree", "Jewelry", "Matching clutch"],
        accessories: ["Bangles", "Studs"],
        colors: ["red", "gold", "cream"],
      },
      {
        title: "Lehenga glam set",
        category: "Traditional",
        items: ["Lehenga", "Choli", "Jewelry"],
        accessories: ["Earrings", "Maang tikka"],
        colors: ["pink", "purple", "gold"],
      },
      {
        title: "Western dress edit",
        category: "Modern",
        items: ["Western dress", "Handbag", "Heels"],
        accessories: ["Sunglasses", "Watch"],
        colors: ["black", "white", "beige"],
      },
      {
        title: "Chic jumpsuit outfit",
        category: "Modern",
        items: ["Jumpsuit", "Heels", "Mini bag"],
        accessories: ["Necklace", "Belt"],
        colors: ["navy", "tan", "silver"],
      },
      {
        title: "Kurti & leggings set",
        category: "Ethnic",
        items: ["Kurti", "Leggings", "Sandals"],
        accessories: ["Earrings", "Bangles"],
        colors: ["teal", "peach", "gold"],
      },
      {
        title: "Luxe western dress",
        category: "Modern",
        items: ["Western dress", "Heels", "Clutch"],
        accessories: ["Earrings", "Bracelet"],
        colors: ["black", "red", "gold"],
      },
    ],
    kids: [
      {
        title: "Playful frock look",
        category: "Kids",
        items: ["Frock", "Sneakers", "Hairband"],
        accessories: ["Bracelet", "Backpack"],
        colors: ["pink", "white", "yellow"],
      },
      {
        title: "Kids t-shirt casual",
        category: "Kids",
        items: ["Kids T-shirt", "Shorts", "Sneakers"],
        accessories: ["Cap", "Sunglasses"],
        colors: ["blue", "green", "orange"],
      },
      {
        title: "Party-ready mini outfit",
        category: "Kids",
        items: ["Party dress", "Dress shoes", "Sparkly bag"],
        accessories: ["Necklace", "Bracelet"],
        colors: ["purple", "gold", "white"],
      },
      {
        title: "Casual kids style",
        category: "Kids",
        items: ["Graphic tee", "Comfort pants", "Sneakers"],
        accessories: ["Cap", "Watch"],
        colors: ["red", "black", "blue"],
      },
    ],
  };

  const groupTemplates = templates[ageGroup === "women" ? "women" : ageGroup === "kids" ? "kids" : "men"] ?? templates.men;
  const filtered = groupTemplates.filter((item) => {
    if (ageGroup === "women") {
      if (look === "traditional") return item.category === "Traditional";
      if (look === "modern") return item.category === "Modern";
      if (look === "casual") return item.category === "Casual";
      if (look === "ethnic") return item.category === "Ethnic";
    }
    if (ageGroup === "kids") {
      return item.category === "Kids";
    }
    if (look === "formal") return item.category === "Formal";
    if (look === "streetwear") return item.category === "Streetwear";
    if (look === "traditional") return item.category === "Traditional";
    return item.category === "Casual";
  });

  const pickImages = ageGroup === "men" ? safeMenImages : ageGroup === "women" ? safeWomenImages : safeKidsImages;
  return shuffle(filtered.length ? filtered : groupTemplates)
    .slice(0, 3)
    .map((template, index) => ({
      ...template,
      id: `${ageGroup}-${look}-${index}-${template.title.replace(/\s+/g, "-").toLowerCase()}`,
      imageUrl: pickRandom(pickImages),
      imageAlt: `${template.title} outfit`,
      rating: Number((8 + Math.random() * 1.8).toFixed(1)),
      matchPercentage: 84 + Math.floor(Math.random() * 16),
    }));
};

const normalizeLabels = (labels: string[]) => labels.map((item) => item.toLowerCase());

const detectAgeGroup = (gender: "male" | "female" | "kid" | "unknown", labels: string[], fileName?: string) => {
  if (gender === "female") return "women";
  if (gender === "kid") return "kids";

  const joined = `${labels.join(" ")} ${(fileName || "").toLowerCase()}`;
  const femaleKeywords = ["woman", "women", "female", "lady", "bride", "girl", "model", "sari", "saree", "lehenga", "kurti", "dress", "handbag", "jewelry", "heels"];
  if (femaleKeywords.some((keyword) => joined.includes(keyword))) return "women";

  const kidKeywords = ["boy", "girl", "child", "kid", "toddler", "infant", "baby", "schoolboy", "schoolgirl"];
  if (kidKeywords.some((keyword) => joined.includes(keyword))) return "kids";

  return "men";
};

const detectGender = (
  labels: string[],
  fileName?: string,
  predictions?: Array<any>,
  detections?: Array<{ class: string; score: number }>
) => {
  const joined = `${labels.join(" ")} ${(fileName || "").toLowerCase()}`;

  const kidKeywords = ["boy", "girl", "child", "kid", "toddler", "infant", "baby", "schoolboy", "schoolgirl", "kids", "childhood"];
  const femaleKeywords = [
    "woman",
    "women",
    "female",
    "lady",
    "bride",
    "girl",
    "sari",
    "saree",
    "lehenga",
    "kurti",
    "dress",
    "handbag",
    "purse",
    "jewelry",
    "jewel",
    "necklace",
    "bangle",
    "bangles",
    "heel",
    "heels",
    "skirt",
    "long hair",
    "longhair",
    "makeup",
    "lipstick",
    "earring",
    "bracelet",
    "gown",
    "wedding gown",
    "evening dress",
  ];

  const maleKeywords = [
    "man",
    "male",
    "gentleman",
    "beard",
    "moustache",
    "mustache",
    "suit",
    "shirt",
    "trouser",
    "trousers",
    "pants",
    "tie",
    "hoodie",
    "hoodies",
    "sneaker",
    "jeans",
    "cargo",
    "cargos",
    "blazer",
    "formal shirt",
    "watch",
  ];

  const personDetected = detections?.some((d) => d.class === "person" && d.score > 0.45);
  if (detections && detections.length > 0 && !personDetected) {
    return "unknown" as const;
  }

  let femaleScore = 0;
  let maleScore = 0;
  let kidScore = 0;

  try {
    const probs = (predictions || []) as Array<any>;
    for (const p of probs) {
      const label = (p.className || "").toLowerCase();
      const weight = Number(p.probability ?? p.prob ?? 0) || 0.5;
      if (femaleKeywords.some((k) => label.includes(k))) femaleScore += weight + 1;
      if (maleKeywords.some((k) => label.includes(k))) maleScore += weight + 1;
      if (kidKeywords.some((k) => label.includes(k))) kidScore += weight + 1;
    }
  } catch {
    // ignore
  }

  if (kidKeywords.some((k) => joined.includes(k))) return "kid";
  if (femaleKeywords.some((k) => joined.includes(k))) return "female";
  if (maleKeywords.some((k) => joined.includes(k))) return "male";

  if (kidScore > femaleScore && kidScore > maleScore && kidScore > 1.5) return "kid";
  if (femaleScore > maleScore && femaleScore > kidScore && femaleScore > 1.5) return "female";
  if (maleScore > femaleScore && maleScore > kidScore && maleScore > 1.5) return "male";

  return "unknown" as const;
};

const filterOutfitsByGender = (gender: string, outfits: Outfit[]) => {
  if (gender === "kid" || gender === "unknown") return outfits;

  const femaleAllowed = ["saree", "sari", "lehenga", "kurti", "western dress", "dress", "jumpsuit", "jewelry", "handbag", "heel", "heels"];
  const maleAllowed = ["shirt", "shirts", "pant", "pants", "hoodie", "hoodies", "watch", "watches", "sneaker", "sneakers", "cargo", "cargos"];

  const allowed = gender === "female" ? femaleAllowed : maleAllowed;

  const filtered = outfits.filter((outfit) => {
    const title = outfit.title.toLowerCase();
    const items = outfit.items.map((i) => i.toLowerCase()).join(" ");
    const combined = `${title} ${items} ${outfit.category.toLowerCase()}`;
    return allowed.some((token) => combined.includes(token));
  });

  return filtered.length ? filtered : outfits;
};

const detectLook = (labels: string[], ageGroup: "men" | "women" | "kids") => {
  const joined = labels.join(" ");
  const styleBuckets: Record<string, string[]> = {
    formal: ["suit", "tie", "blazer", "tuxedo", "button", "dress shirt", "formal", "business", "blouse"],
    casual: ["jeans", "jean", "t-shirt", "tshirt", "hoodie", "sweatshirt", "sneakers", "casual", "denim", "shirt"],
    streetwear: ["street", "urban", "skateboard", "oversized", "cargo", "chain", "sneaker", "hoodie", "cap"],
    traditional: ["sari", "saree", "lehenga", "kurta", "ethnic", "traditional", "kimono", "salwar", "bandhgala"],
    stylish: ["gown", "dress", "heels", "fashion", "glamour", "model", "runway"],
  };

  const scores = Object.entries(styleBuckets).map(([style, keywords]) => [
    style,
    keywords.reduce((sum, keyword) => sum + (joined.includes(keyword) ? 1 : 0), 0),
  ]) as [string, number][];

  const best = scores.sort((a, b) => b[1] - a[1])[0];
  let style = best[1] > 0 ? best[0] : "casual";

  if (ageGroup === "women") {
    if (style === "formal") return "formal";
    if (style === "stylish") return "stylish";
    if (style === "streetwear") return "streetwear";
    if (style === "traditional") return "traditional";
    return "casual";
  }

  if (ageGroup === "kids") {
    const partyKeywords = ["party", "birthday", "play", "toy", "school"];
    if (partyKeywords.some((keyword) => joined.includes(keyword))) return "party";
    return "casual";
  }

  if (style === "stylish") return "streetwear";
  return style;
};

const createAnalysisResult = async (file: File, previewUrl: string | null, manualGenderChoice: 'auto' | 'male' | 'female' | 'kid' = 'auto'): Promise<AnalysisResult> => {
  const objectUrl = URL.createObjectURL(file);
  const imageElement = new Image();
  imageElement.src = objectUrl;
  await imageElement.decode();

  try {
    const [mobilenetModel, cocoModel] = await Promise.all([getMobilenetModel(), getCocoSsdModel()]);
    const [predictions, detections] = await Promise.all([
      mobilenetModel.classify(imageElement) as Promise<Array<{ className: string; probability?: number }>>,
      cocoModel.detect(imageElement),
    ]);
    const labels = normalizeLabels(predictions.map((prediction) => prediction.className));
    const detectedGender = detectGender(labels, file.name, predictions, detections);
    const gender = manualGenderChoice !== 'auto' ? manualGenderChoice : detectedGender;

    const ageGroup = detectAgeGroup(gender, labels, file.name);
    const look = detectLook(labels, ageGroup);

    URL.revokeObjectURL(objectUrl);

    const outfits = buildOutfitRecommendations(ageGroup, look);
    const filtered = gender === 'unknown' ? outfits : filterOutfitsByGender(gender, outfits);

    return {
      gender: gender === 'unknown' ? (ageGroup === 'women' ? 'female' : ageGroup === 'kids' ? 'kid' : 'male') : gender,
      ageGroup,
      look,
      imageUrl: previewUrl || "",
      outfits: filtered,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    const fallbackDetected = detectGender([], file.name);
    const gender = manualGenderChoice !== 'auto' ? manualGenderChoice : fallbackDetected;
    const ageGroup = detectAgeGroup(gender, [], file.name);
    const outfits = buildOutfitRecommendations(ageGroup, 'casual');
    const filtered = gender === 'unknown' ? outfits : filterOutfitsByGender(gender, outfits);

    return {
      gender: gender === 'unknown' ? (ageGroup === 'women' ? 'female' : ageGroup === 'kids' ? 'kid' : 'male') : gender,
      ageGroup,
      look: 'casual',
      imageUrl: previewUrl || '',
      outfits: filtered,
    };
  }
};

export const Route = createFileRoute("/ai-stylist")({
  component: AIStylist,
  head: () => ({
    meta: [
      { title: "AI Outfit Recommender | Shopee Mania" },
      { name: "description", content: "Upload your photo, analyze gender, and get premium outfit suggestions." },
    ],
  }),
});

function AIStylist() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [manualGender, setManualGender] = useState<'auto' | 'male' | 'female' | 'kid'>('auto');

  const clearSelection = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setResult(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      if (!nextFile) {
        clearSelection();
        return;
      }
      setResult(null);
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
    },
    [clearSelection]
  );

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (!dropped) return;
    setResult(null);
    setFile(dropped);
    setPreviewUrl(URL.createObjectURL(dropped));
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!file) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const analysis = await createAnalysisResult(file, previewUrl, manualGender);
      setResult(analysis);
    } catch {
      const inferred = manualGender !== 'auto' ? manualGender : detectGender([], file?.name);
      const inferredAge = inferred === "kid" ? "kids" : inferred === "female" ? "women" : "men";
      const outfits = buildOutfitRecommendations(inferredAge as any, "casual");
      const filtered = filterOutfitsByGender(inferred, outfits);
      setResult({
        gender: inferred === "kid" ? "kid" : inferred === "female" ? "female" : "male",
        ageGroup: inferredAge as any,
        look: "casual",
        imageUrl: previewUrl || "",
        outfits: filtered,
      });
    } finally {
      setLoading(false);
    }
  }, [file, previewUrl, manualGender]);

  const ageGroupLabel = result?.gender === "female" ? "Women" : result?.gender === "kid" ? "Kids" : "Men";

  return (
    <Layout>
      <div className="min-h-screen bg-[#07080f] text-white">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-10">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-200">
                  <Sparkles className="h-4 w-4" /> Premium AI Outfit Recommender
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Upload your photo and get tailored outfit suggestions.</h1>
                <p className="max-w-2xl text-sm leading-7 text-white/70">
                  Simple, clean, and fast. The AI analyzes your style and presents premium matching outfits instantly.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.8fr_0.7fr]">
                <div
                  className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:border-amber-300/30"
                  onDrop={handleDrop}
                  onDragOver={(event) => event.preventDefault()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Upload preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex min-h-[360px] flex-col items-center justify-center gap-6 p-8 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-300/10 text-amber-300">
                        <UploadCloud className="h-10 w-10" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Drag & drop your photo</h2>
                        <p className="mt-2 text-sm text-white/60">JPG, PNG, or WEBP files are supported.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
                  <label htmlFor="photo-upload" className="block cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-semibold transition hover:bg-white/10">
                    <span className="flex items-center justify-center gap-2 text-white">
                      <UploadCloud className="h-4 w-4" /> Select Image
                    </span>
                    <input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </label>

                  <div className="mt-4">
                    <label className="text-xs text-white/60">Use category</label>
                    <select
                      value={manualGender}
                      onChange={(e) => setManualGender(e.target.value as any)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="male">Men</option>
                      <option value="female">Women</option>
                      <option value="kid">Kids</option>
                    </select>
                  </div>

                  {file && (
                    <button onClick={clearSelection} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
                      <X className="h-4 w-4" /> Clear Selection
                    </button>
                  )}

                  <button
                    onClick={analyzeImage}
                    disabled={!file || loading}
                    className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-black shadow-xl shadow-amber-500/20 transition duration-300 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                      </span>
                    ) : (
                      "Analyze Image"
                    )}
                  </button>

                  {result && (
                    <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Analysis</p>
                      <div className="mt-4 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase text-white/40">Detected group</p>
                          <p className="mt-1 font-semibold text-white">{ageGroupLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white/40">Gender</p>
                          <p className="mt-1 font-semibold text-white">{result.gender === "male" ? "Male" : result.gender === "female" ? "Female" : "Kid"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-white/40">Look</p>
                          <p className="mt-1 font-semibold text-white">{result.look ? result.look.charAt(0).toUpperCase() + result.look.slice(1) : "Casual"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {result && (
              <section className="space-y-6">
                <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 shadow-lg shadow-black/10 transition duration-300 hover:border-amber-300/40 hover:bg-white/10">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{result.gender === "female" ? "WOMEN OUTFITS" : result.gender === "male" ? "MEN OUTFITS" : "KIDS OUTFITS"}</p>
                    <h2 className="mt-2 text-3xl font-black text-white">Top picks based on your photo</h2>
                  </div>
                  <div className="rounded-2xl bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200">{result.outfits.length} looks</div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  {result.outfits.map((outfit) => (
                    <article key={outfit.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-300/40">
                      <div className="relative h-72 bg-white/5">
                        <img src={outfit.imageUrl} alt={outfit.imageAlt} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.28em] text-white/40">{outfit.category}</p>
                            <h3 className="mt-2 text-xl font-black text-white">{outfit.title}</h3>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/80">
                          <span className="rounded-2xl bg-white/5 px-3 py-2">Rating {outfit.rating}/10</span>
                          <span className="rounded-2xl bg-white/5 px-3 py-2">{outfit.matchPercentage}% match</span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Matching items</p>
                          <ul className="mt-2 space-y-2 text-sm text-white/80">
                            {outfit.items.map((item) => (
                              <li key={item} className="rounded-2xl bg-white/5 px-3 py-2">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Accessories</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {outfit.accessories.map((accessory) => (
                              <span key={accessory} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                                {accessory}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Colors</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {outfit.colors.map((swatch) => (
                              <span key={swatch} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
                                {swatch}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
