import { useMemo, useState } from "react";
import { Check, Copy, X } from "lucide-react";

type Model = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  createdAt: number;
};

type PortfolioSettings = {
  artistName: string;
  subtitle: string;
  discordTag: string;
  commissionsOpen: boolean;
  showCaptionsOnGrid: boolean;
};

// Add new pictures here. Put files in public/imgs and use "/imgs/file.png".
const INITIAL_MODELS = [
  {
    title: "Phantom Samurai",
    category: "Rigs & Armor",
    imageUrl: "/imgs/PhantomSamurai.png",
    order: 1,
  },
  {
    title: "City Hall",
    category: "Props",
    imageUrl: "/imgs/CityHall.png",
    order: 2,
  },
  {
    title: "Pink House",
    category: "Props",
    imageUrl: "/imgs/PinkHouse.png",
    order: 3,
  },
  {
    title: "Fire House",
    category: "Props",
    imageUrl: "/imgs/FireHouse.png",
    order: 4,
  },
  {
    title: "Fire Truck",
    category: "Props",
    imageUrl: "/imgs/Render.png",
    order: 5,
  },
  {
    title: "Old PC",
    category: "Props",
    imageUrl: "/imgs/OldPC.png",
    order: 6,
  },
  {
    title: "Rubber Fruit",
    category: "Other",
    imageUrl: "/imgs/RubberFruit.png",
    order: 7,
  },
  {
    title: "Death Scythe",
    category: "Weapons",
    imageUrl: "/imgs/DeathScythe.png",
    order: 8,
  },
  {
    title: "Curved Sword",
    category: "Weapons",
    imageUrl: "/imgs/CurvySword.png",
    order: 9,
  },
  {
    title: "Bandage Sword",
    category: "Weapons",
    imageUrl: "/imgs/BandageSword.png",
    order: 10,
  },
  {
    title: "Nature Weapon Collection",
    category: "Weapons",
    imageUrl: "/imgs/WeaponCollection.png",
    order: 11,
  },
  {
    title: "Barrel",
    category: "Props",
    imageUrl: "/imgs/Barrel.png",
    order: 12,
  },
];

const CATEGORIES = ["All", "Weapons", "Rigs & Armor", "Props", "Other"];

export default function App() {
  const [models] = useState<Model[]>(
    INITIAL_MODELS.map((model, index) => ({
      ...model,
      id: `model-${index + 1}`,
      createdAt: 0,
    })),
  );
  const [settings] = useState<PortfolioSettings>({
    artistName: "MIRKO4001",
    subtitle: "3D MODELS",
    discordTag: "mirko4001",
    commissionsOpen: true,
    showCaptionsOnGrid: true,
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxModel, setLightboxModel] = useState<Model | null>(null);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredModels = useMemo(() => {
    const visible =
      activeCategory === "All"
        ? models
        : models.filter((model) => model.category === activeCategory);
    return [...visible].sort((a, b) => a.order - b.order);
  }, [models, activeCategory]);

  const copyDiscord = () => {
    const el = document.createElement("textarea");
    el.value = settings.discordTag;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopiedDiscord(true);
    setToast(`Discord kopiert: ${settings.discordTag}`);
    setTimeout(() => {
      setCopiedDiscord(false);
      setToast(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-white selection:text-black">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 border border-white/40 text-white px-4 py-2 rounded text-xs tracking-wide shadow-2xl">
          {toast}
        </div>
      )}

      <header className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h1 className="text-sm sm:text-base font-bold tracking-[0.18em] text-white uppercase">
            {settings.artistName}{" "}
            <span className="text-neutral-500 font-normal">
              / {settings.subtitle}
            </span>
          </h1>
          <nav className="hidden md:flex items-center gap-4 text-xs tracking-wider uppercase">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`transition-colors ${
                  activeCategory === category
                    ? "text-white font-semibold underline underline-offset-4"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-400 uppercase tracking-wider">
              Commissions Open
            </span>
          </div>
          <span className="text-neutral-700">|</span>
          <button
            onClick={copyDiscord}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            title="Discord-Tag kopieren"
          >
            {copiedDiscord ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Discord: {settings.discordTag}</span>
          </button>
        </div>
      </header>

      <div className="md:hidden max-w-[1400px] mx-auto px-4 pb-3 flex items-center gap-4 overflow-x-auto text-xs uppercase tracking-wider">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap ${
              activeCategory === category
                ? "text-white font-semibold underline"
                : "text-neutral-500"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setLightboxModel(model)}
              className="group relative aspect-[16/10] rounded-lg border-[2px] border-white/90 bg-[#141414] overflow-hidden cursor-pointer select-none text-left"
            >
              <img
                src={model.imageUrl}
                alt={model.title}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.015]"
              />
              {settings.showCaptionsOnGrid && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3 text-sm font-medium text-white tracking-wide drop-shadow">
                  {model.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </main>

      {lightboxModel && (
        <div
          onClick={() => setLightboxModel(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <button
            onClick={() => setLightboxModel(null)}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white"
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-w-5xl w-full flex flex-col items-center"
          >
            <div className="w-full rounded-lg border-2 border-white/90 overflow-hidden bg-[#111]">
              <img
                src={lightboxModel.imageUrl}
                alt={lightboxModel.title}
                className="w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>
            <p className="mt-4 text-base sm:text-lg text-white font-medium tracking-wide">
              {lightboxModel.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
