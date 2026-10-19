import { useState, useEffect, useRef, useMemo } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  X,
  Upload,
  Check,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

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
  adminPassword: string;
};

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================
const firebaseConfig = (() => {
  if (typeof __firebase_config === "undefined" || !__firebase_config) {
    return {};
  }

  try {
    return JSON.parse(__firebase_config);
  } catch {
    console.warn(
      "Ungültige Firebase-Konfiguration, lokaler Modus wird verwendet.",
    );
    return {};
  }
})();

const appId =
  typeof __app_id !== "undefined" ? __app_id : "roblox-3d-portfolio";
const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// ==========================================
// CLEAN STUDIO RENDER PLACEHOLDERS (MATCHING SCREENSHOT STYLE)
// ==========================================
const createSvgDataUrl = (svgString: string) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

const STUDIO_RENDERS = {
  torsoRig: createSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <radialGradient id="studioGray" cx="50%" cy="55%" r="65%">
          <stop offset="0%" stop-color="#8c8c8c"/>
          <stop offset="60%" stop-color="#454545"/>
          <stop offset="100%" stop-color="#222222"/>
        </radialGradient>
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d6b899"/>
          <stop offset="50%" stop-color="#b89778"/>
          <stop offset="100%" stop-color="#8a6d53"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#studioGray)"/>
      <!-- Floor Shadow -->
      <ellipse cx="400" cy="415" rx="140" ry="24" fill="#000000" opacity="0.45"/>
      <!-- Roblox Character Base (Head & Legs White Clay) -->
      <g transform="translate(0, -10)">
        <!-- Head -->
        <rect x="368" y="65" width="64" height="68" rx="16" fill="#e5e5e5" stroke="#cccccc" stroke-width="1.5"/>
        <!-- Legs -->
        <rect x="342" y="275" width="54" height="135" rx="4" fill="#d4d4d4" stroke="#b3b3b3" stroke-width="1.5"/>
        <rect x="404" y="275" width="54" height="135" rx="4" fill="#c4c4c4" stroke="#a3a3a3" stroke-width="1.5"/>
        <!-- Sculpted Muscular Torso -->
        <rect x="338" y="135" width="124" height="138" rx="12" fill="url(#skinTone)" stroke="#735740" stroke-width="2"/>
        <!-- Chest Pecs -->
        <rect x="346" y="143" width="52" height="44" rx="10" fill="#dfc3a6" stroke="#8a6d53" stroke-width="2"/>
        <rect x="402" y="143" width="52" height="44" rx="10" fill="#cfaea0" stroke="#8a6d53" stroke-width="2"/>
        <!-- 6-Pack Abs Sculpt -->
        <rect x="366" y="192" width="31" height="22" rx="6" fill="#d6b899" stroke="#7d6149" stroke-width="1.8"/>
        <rect x="403" y="192" width="31" height="22" rx="6" fill="#c9ab8d" stroke="#7d6149" stroke-width="1.8"/>
        <rect x="366" y="217" width="31" height="22" rx="6" fill="#d6b899" stroke="#7d6149" stroke-width="1.8"/>
        <rect x="403" y="217" width="31" height="22" rx="6" fill="#c9ab8d" stroke="#7d6149" stroke-width="1.8"/>
        <rect x="368" y="242" width="29" height="20" rx="5" fill="#c9ab8d" stroke="#7d6149" stroke-width="1.8"/>
        <rect x="403" y="242" width="29" height="20" rx="5" fill="#bda082" stroke="#7d6149" stroke-width="1.8"/>
        <!-- Sculpted Muscular Left Arm -->
        <rect x="278" y="138" width="56" height="122" rx="14" fill="url(#skinTone)" stroke="#735740" stroke-width="2"/>
        <rect x="283" y="144" width="46" height="48" rx="12" fill="#dfc3a6" stroke="#8a6d53" stroke-width="1.5"/>
        <rect x="282" y="256" width="48" height="20" rx="4" fill="#d4d4d4"/>
        <!-- Sculpted Muscular Right Arm -->
        <rect x="466" y="138" width="56" height="122" rx="14" fill="url(#skinTone)" stroke="#735740" stroke-width="2"/>
        <rect x="471" y="144" width="46" height="48" rx="12" fill="#cfaea0" stroke="#8a6d53" stroke-width="1.5"/>
        <rect x="470" y="256" width="48" height="20" rx="4" fill="#c4c4c4"/>
      </g>
    </svg>
  `),
  natureWeapons: createSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <radialGradient id="darkSlate" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1e262b"/>
          <stop offset="100%" stop-color="#0c0f12"/>
        </radialGradient>
        <linearGradient id="greenBlade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#84cc16"/>
          <stop offset="50%" stop-color="#4d7c0f"/>
          <stop offset="100%" stop-color="#22c55e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#darkSlate)"/>
      <!-- Scythe (Top Right) -->
      <g transform="translate(460, 70)">
        <path d="M 30,25 Q 130,10 195,95 Q 115,60 40,55 Z" fill="url(#greenBlade)" stroke="#bef264" stroke-width="1.5"/>
        <path d="M 15,20 C 35,85 20,160 35,245" stroke="#5c4033" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M 18,75 C 32,120 22,175 32,210" stroke="#7e22ce" stroke-width="10" fill="none" stroke-dasharray="16 14"/>
        <polygon points="10,15 55,15 45,45 5,35" fill="#d6b899" stroke="#8a6d53" stroke-width="1.5"/>
      </g>
      <!-- Twin Blade (Top Left) -->
      <g transform="translate(230, 50) rotate(25)">
        <path d="M 40,20 Q 95,-25 130,30 Q 85,25 50,45 Z" fill="url(#greenBlade)"/>
        <path d="M 40,120 Q -15,165 -50,110 Q -5,115 30,95 Z" fill="url(#greenBlade)"/>
        <line x1="25" y1="100" x2="55" y2="40" stroke="#5c4033" stroke-width="12" stroke-linecap="round"/>
        <line x1="30" y1="90" x2="50" y2="50" stroke="#9333ea" stroke-width="8"/>
      </g>
      <!-- Curved Nature Khopesh (Bottom Left) -->
      <g transform="translate(260, 255)">
        <path d="M 20,160 L 25,95 C 25,50 75,35 70,80 C 65,115 35,110 30,130" stroke="#5c4033" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M 45,35 Q 105,40 85,105 Q 68,85 50,55 Z" fill="url(#greenBlade)" stroke="#a3e635" stroke-width="1"/>
        <circle cx="20" cy="168" r="10" fill="#4d7c0f"/>
      </g>
      <!-- Nature Dagger (Bottom Center) -->
      <g transform="translate(390, 345) rotate(-12)">
        <line x1="0" y1="30" x2="55" y2="18" stroke="#7f1d1d" stroke-width="8" stroke-linecap="round"/>
        <path d="M 55,18 Q 115,-5 155,22 Q 105,22 55,24 Z" fill="url(#greenBlade)"/>
      </g>
      <!-- Dual Crescent Blades (Bottom Right) -->
      <g transform="translate(565, 250)">
        <path d="M 10,20 Q 15,105 70,135 Q 45,85 25,20 Z" fill="url(#greenBlade)"/>
        <path d="M 85,50 Q 65,120 15,155 Q 45,110 70,45 Z" fill="url(#greenBlade)"/>
        <line x1="25" y1="145" x2="65" y2="115" stroke="#581c87" stroke-width="9" stroke-linecap="round"/>
      </g>
    </svg>
  `),
  darkGreatsword: createSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <radialGradient id="purpleStudio" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#38334c"/>
          <stop offset="100%" stop-color="#191624"/>
        </radialGradient>
        <linearGradient id="darkSteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#52525b"/>
          <stop offset="50%" stop-color="#3f3f46"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#purpleStudio)"/>
      <g transform="translate(410, 255) rotate(18) translate(-410, -255)">
        <!-- Curved Dark Blade -->
        <path d="M 395,330 L 385,160 Q 382,85 355,40 Q 418,75 426,155 L 420,170 L 432,180 L 412,330 Z" fill="url(#darkSteel)" stroke="#71717a" stroke-width="1.5"/>
        <!-- Inner fuller bevel -->
        <path d="M 402,320 L 395,165 Q 393,105 375,65 Q 408,95 412,165 Z" fill="#27272a"/>
        <!-- Crossguard & Cloth Wraps -->
        <polygon points="365,330 445,330 430,355 380,355" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
        <!-- Bandage Strips -->
        <path d="M 382,340 L 428,350 L 385,368 L 422,380" stroke="#d6d3d1" stroke-width="5" fill="none"/>
        <!-- Handle -->
        <line x1="405" y1="355" x2="405" y2="445" stroke="#18181b" stroke-width="11"/>
        <line x1="400" y1="370" x2="410" y2="430" stroke="#e7e5e4" stroke-width="3" stroke-dasharray="6 8"/>
        <!-- Pommel Spike -->
        <polygon points="393,445 417,445 405,470" fill="#27272a" stroke="#71717a" stroke-width="1.5"/>
      </g>
    </svg>
  `),
  boneKatana: createSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <radialGradient id="charcoalStudio" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#26252b"/>
          <stop offset="100%" stop-color="#121215"/>
        </radialGradient>
        <linearGradient id="boneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e5c39c"/>
          <stop offset="50%" stop-color="#c69c72"/>
          <stop offset="100%" stop-color="#8c6239"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#charcoalStudio)"/>
      <g transform="translate(415, 250) rotate(12) translate(-415, -250)">
        <!-- Curved Bone Blade -->
        <path d="M 398,340 Q 435,190 365,35 Q 452,175 422,340 Z" fill="url(#boneGrad)" stroke="#f3dec6" stroke-width="1"/>
        <!-- Serrated Bone Teeth along spine -->
        <path d="M 418,165 L 430,170 L 420,180 L 432,185 L 422,195 L 434,200 L 423,210 L 435,215 L 424,225 L 435,230 L 422,245 L 433,250 L 420,265 L 431,270 L 417,285 L 428,290 L 414,305" stroke="#b58960" stroke-width="3" fill="none"/>
        <!-- Crimson Guard Shroud -->
        <path d="M 392,335 Q 415,280 432,338 L 426,395 Q 415,425 435,435 Q 408,425 408,385 L 392,355 Z" fill="#7f1d1d" stroke="#991b1b" stroke-width="1.5"/>
        <!-- Wrapped Teal Handle -->
        <path d="M 398,350 C 388,380 390,415 402,445" stroke="#2dd4bf" stroke-width="9" fill="none" stroke-dasharray="5 3"/>
        <!-- Curved Bone Pommel Tip -->
        <path d="M 402,445 Q 410,470 392,475" stroke="#d6b187" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `),
};

const INITIAL_MODELS = [
  {
    title: "Sculpted R15 Muscular Rig",
    category: "Rigs & Armor",
    imageUrl: STUDIO_RENDERS.torsoRig,
    order: 1,
    createdAt: Date.now() - 400000,
  },
  {
    title: "Stylized Nature Weapon Pack",
    category: "Weapons",
    imageUrl: STUDIO_RENDERS.natureWeapons,
    order: 2,
    createdAt: Date.now() - 300000,
  },
  {
    title: "Dark Curved Greatsword",
    category: "Weapons",
    imageUrl: STUDIO_RENDERS.darkGreatsword,
    order: 3,
    createdAt: Date.now() - 200000,
  },
  {
    title: "Serrated Bone Katana",
    category: "Weapons",
    imageUrl: STUDIO_RENDERS.boneKatana,
    order: 4,
    createdAt: Date.now() - 100000,
  },
];

const CATEGORIES = ["All", "Weapons", "Rigs & Armor", "Props", "Other"];

// ==========================================
// HIGH-RES IMAGE COMPRESSION HELPER
// ==========================================
const compressImageToBase64 = (
  file: File,
  maxWidth = 1400,
  maxHeight = 1000,
  quality = 0.85,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (typeof event.target?.result !== "string") {
        reject(new Error("Bild konnte nicht gelesen werden"));
        return;
      }
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas-Kontext ist nicht verfügbar"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// ==========================================
// MAIN MINIMALIST PORTFOLIO COMPONENT
// ==========================================
export default function App() {
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<PortfolioSettings>({
    artistName: "MIRKO4001",
    subtitle: "3D MODELS",
    discordTag: "mirko4001",
    commissionsOpen: true,
    showCaptionsOnGrid: true,
    adminPassword: "", // Default: 'admin123'
  });

  // Filter & Lightbox
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxModel, setLightboxModel] = useState<Model | null>(null);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Upload / Edit Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [uploadTab, setUploadTab] = useState("file"); // 'file' | 'url'
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<
    Omit<Model, "id" | "order" | "createdAt">
  >({
    title: "",
    category: "Weapons",
    imageUrl: "",
  });

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    artistName: "",
    discordTag: "",
    newPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const seededRef = useRef(false);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // 1. Firebase Auth
  useEffect(() => {
    if (!auth) {
      setModels(
        INITIAL_MODELS.map((model, index) => ({
          ...model,
          id: `local-${index + 1}`,
        })),
      );
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // 2. Firestore Data Sync
  useEffect(() => {
    if (!user || !db) return;

    const modelsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "minimal_models_v2",
    );
    const configRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "portfolio_config",
    );

    const unsubModels = onSnapshot(
      modelsRef,
      async (snapshot) => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          try {
            for (const item of INITIAL_MODELS) {
              await addDoc(modelsRef, item);
            }
          } catch (e) {
            console.error("Seed error:", e);
          }
        } else {
          const list: Model[] = snapshot.docs.map(
            (d) =>
              ({
                id: d.id,
                ...d.data(),
              }) as Model,
          );
          list.sort(
            (a, b) =>
              (a.order ?? 999) - (b.order ?? 999) ||
              (b.createdAt ?? 0) - (a.createdAt ?? 0),
          );
          setModels(list);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Models fetch error:", err);
        setLoading(false);
      },
    );

    const unsubConfig = onSnapshot(
      configRef,
      (snapshot) => {
        const docSnap = snapshot.docs.find((d) => d.id === "minimal_settings");
        if (docSnap) {
          setSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (err) => console.error("Settings error:", err),
    );

    return () => {
      unsubModels();
      unsubConfig();
    };
  }, [user]);

  const filteredModels = useMemo(() => {
    if (activeCategory === "All") return models;
    return models.filter((m) => m.category === activeCategory);
  }, [models, activeCategory]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const currentPassword = settings.adminPassword || "admin123";

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordInput === currentPassword) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setLoginError("");
      notify("Admin-Modus aktiv");
    } else {
      setLoginError("Falsches Passwort");
    }
  };

  const toggleSettingFlag = async (
    key: "commissionsOpen" | "showCaptionsOnGrid",
  ) => {
    if (!user || !isAdmin || !db) return;
    const nextVal = !settings[key];
    try {
      const ref = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "portfolio_config",
        "minimal_settings",
      );
      await setDoc(ref, { ...settings, [key]: nextVal }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingModel(null);
    setFormData({
      title: "",
      category: "Weapons",
      imageUrl: "",
    });
    setUploadTab("file");
    setShowUploadModal(true);
  };

  const openEditModal = (model: Model, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingModel(model);
    setFormData({
      title: model.title || "",
      category: model.category || "Weapons",
      imageUrl: model.imageUrl || "",
    });
    setUploadTab(model.imageUrl?.startsWith("http") ? "url" : "file");
    setShowUploadModal(true);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const dataUrl = await compressImageToBase64(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModel = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAdmin || !db || !formData.imageUrl) return;

    setIsSaving(true);
    try {
      const colRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "minimal_models_v2",
      );
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
      };

      if (editingModel) {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "minimal_models_v2",
          editingModel.id,
        );
        await updateDoc(docRef, payload);
        notify("Bild aktualisiert");
      } else {
        const minOrder =
          models.length > 0
            ? Math.min(...models.map((m) => m.order ?? 0)) - 1
            : 1;
        await addDoc(colRef, {
          ...payload,
          order: minOrder,
          createdAt: Date.now(),
        });
        notify("Bild hinzugefügt");
      }
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user || !isAdmin || !db) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "minimal_models_v2", id),
      );
      if (lightboxModel?.id === id) setLightboxModel(null);
      notify("Gelöscht");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveOrder = async (
    index: number,
    direction: number,
    e?: MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    if (!user || !isAdmin || !db) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredModels.length) return;

    const currentItem = filteredModels[index];
    const swapItem = filteredModels[targetIndex];

    try {
      const refA = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "minimal_models_v2",
        currentItem.id,
      );
      const refB = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "minimal_models_v2",
        swapItem.id,
      );
      await updateDoc(refA, { order: targetIndex });
      await updateDoc(refB, { order: index });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !isAdmin || !db) return;
    try {
      const ref = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "portfolio_config",
        "minimal_settings",
      );
      await setDoc(
        ref,
        {
          ...settings,
          artistName: settingsForm.artistName.trim() || settings.artistName,
          discordTag: settingsForm.discordTag.trim() || settings.discordTag,
          adminPassword: settingsForm.newPassword.trim()
            ? settingsForm.newPassword.trim()
            : currentPassword,
        },
        { merge: true },
      );
      setShowSettingsModal(false);
      notify("Einstellungen gespeichert");
    } catch (err) {
      console.error(err);
    }
  };

  const copyDiscord = () => {
    const el = document.createElement("textarea");
    el.value = settings.discordTag;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopiedDiscord(true);
    notify(`Discord kopiert: ${settings.discordTag}`);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-white selection:text-black">
      {/* Minimal Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 border border-white/40 text-white px-4 py-2 rounded text-xs tracking-wide shadow-2xl">
          {toast}
        </div>
      )}

      {/* ========================================== */}
      {/* ULTRA-SIMPLE TOP BAR */}
      {/* ========================================== */}
      <header className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h1 className="text-sm sm:text-base font-bold tracking-[0.18em] text-white uppercase">
            {settings.artistName}{" "}
            <span className="text-neutral-500 font-normal">
              / {settings.subtitle}
            </span>
          </h1>

          {/* Simple Category Text Filter */}
          <nav className="hidden md:flex items-center gap-4 text-xs tracking-wider uppercase">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`transition-colors ${
                  activeCategory === cat
                    ? "text-white font-semibold underline underline-offset-4"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side: Commission Status, Discord & Subtle Admin Lock */}
        <div className="flex items-center gap-4 text-xs">
          {/* Commission Status Dot */}
          <button
            type="button"
            onClick={
              isAdmin ? () => toggleSettingFlag("commissionsOpen") : undefined
            }
            title={isAdmin ? "Klicken zum Umschalten" : ""}
            className={`flex items-center gap-2 ${isAdmin ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.commissionsOpen ? "bg-emerald-400" : "bg-red-500"
              }`}
            />
            <span className="text-neutral-400 uppercase tracking-wider">
              {settings.commissionsOpen ? "Commissions Open" : "Closed"}
            </span>
          </button>

          <span className="text-neutral-700">|</span>

          {/* Discord Copy */}
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

          {/* Admin Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <button
                onClick={openAddModal}
                className="px-3 py-1.5 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Foto hochladen</span>
              </button>

              <button
                onClick={() => toggleSettingFlag("showCaptionsOnGrid")}
                title={
                  settings.showCaptionsOnGrid
                    ? "Beschriftungen im Grid ausblenden"
                    : "Beschriftungen im Grid einblenden"
                }
                className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white"
              >
                {settings.showCaptionsOnGrid ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => {
                  setSettingsForm({
                    artistName: settings.artistName,
                    discordTag: settings.discordTag,
                    newPassword: "",
                  });
                  setShowSettingsModal(true);
                }}
                title="Einstellungen & Passwort"
                className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsAdmin(false);
                  notify("Abgemeldet");
                }}
                title="Admin-Modus beenden"
                className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white"
              >
                <Unlock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setPasswordInput("");
                setLoginError("");
                setShowLoginModal(true);
              }}
              title="Admin Login"
              className="text-neutral-600 hover:text-neutral-300 transition-colors p-1"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Category Row */}
      <div className="md:hidden max-w-[1400px] mx-auto px-4 pb-3 flex items-center gap-4 overflow-x-auto text-xs uppercase tracking-wider">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap ${
              activeCategory === cat
                ? "text-white font-semibold underline"
                : "text-neutral-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* 2-COLUMN IMAGE GRID (MATCHING SCREENSHOT) */}
      {/* ========================================== */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[16/10] rounded-lg border-2 border-white/20 bg-neutral-900 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModels.map((model, idx) => (
              <div
                key={model.id}
                onClick={() => setLightboxModel(model)}
                className="group relative aspect-[16/10] rounded-lg border-[2px] border-white/90 bg-[#141414] overflow-hidden cursor-pointer select-none"
              >
                {/* Render Image */}
                <img
                  src={model.imageUrl}
                  alt={model.title || "3D Model"}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.015]"
                />

                {/* Clean Caption Overlay at Bottom */}
                {model.title && (
                  <div
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3 transition-opacity duration-200 ${
                      settings.showCaptionsOnGrid
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <p className="text-sm font-medium text-white tracking-wide drop-shadow">
                      {model.title}
                    </p>
                  </div>
                )}

                {/* Admin Overlay Controls on Card */}
                {isAdmin && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 border border-white/25 rounded px-2 py-1 backdrop-blur-sm"
                  >
                    <button
                      onClick={(e) => handleMoveOrder(idx, -1, e)}
                      disabled={idx === 0}
                      title="Nach vorne"
                      className="p-1 text-neutral-300 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveOrder(idx, 1, e)}
                      disabled={idx === filteredModels.length - 1}
                      title="Nach hinten"
                      className="p-1 text-neutral-300 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => openEditModal(model, e)}
                      title="Beschriftung / Bild ändern"
                      className="p-1 text-neutral-300 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(model.id, e)}
                      title="Löschen"
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Quick Add Tile when logged in as Admin */}
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="aspect-[16/10] rounded-lg border-2 border-dashed border-white/30 hover:border-white/80 bg-[#0d0d0d] hover:bg-[#141414] flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-all"
              >
                <Plus className="w-8 h-8" />
                <span className="text-xs uppercase tracking-widest font-semibold">
                  Neues Bild hinzufügen
                </span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {/* ========================================== */}
      {lightboxModel && (
        <div
          onClick={() => setLightboxModel(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <button
            onClick={() => setLightboxModel(null)}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full flex flex-col items-center"
          >
            <div className="w-full rounded-lg border-2 border-white/90 overflow-hidden bg-[#111]">
              <img
                src={lightboxModel.imageUrl}
                alt={lightboxModel.title}
                className="w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>

            {lightboxModel.title && (
              <div className="mt-4 text-center">
                <p className="text-base sm:text-lg text-white font-medium tracking-wide">
                  {lightboxModel.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SIMPLE ADMIN LOGIN MODAL */}
      {/* ========================================== */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-[#111] border border-white/30 rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Admin Login
              </span>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Passwort (Standard: admin123)"
                autoFocus
                className="w-full px-3 py-2 bg-black border border-neutral-700 focus:border-white rounded text-sm text-white focus:outline-none"
              />
              {loginError && (
                <p className="text-xs text-red-400">{loginError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
              >
                Anmelden
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SIMPLE UPLOAD / EDIT MODAL */}
      {/* ========================================== */}
      {showUploadModal && isAdmin && (
        <div
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#111] border border-white/30 rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {editingModel ? "Eintrag bearbeiten" : "Neues Bild hochladen"}
              </span>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-4">
              {/* Toggle File vs URL */}
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadTab("file")}
                  className={`flex-1 py-1.5 rounded border ${
                    uploadTab === "file"
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-black text-neutral-400 border-neutral-800"
                  }`}
                >
                  Datei auswählen
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab("url")}
                  className={`flex-1 py-1.5 rounded border ${
                    uploadTab === "url"
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-black text-neutral-400 border-neutral-800"
                  }`}
                >
                  Bild-URL
                </button>
              </div>

              {uploadTab === "file" ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-neutral-600 hover:border-white rounded-lg p-4 text-center cursor-pointer bg-black"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Vorschau"
                      className="max-h-44 mx-auto rounded object-contain"
                    />
                  ) : (
                    <div className="py-6 space-y-2 text-neutral-400">
                      <Upload className="w-6 h-6 mx-auto" />
                      <p className="text-xs">
                        Klicken, um ein Bild auszuwählen
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={
                    formData.imageUrl.startsWith("data:")
                      ? ""
                      : formData.imageUrl
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-black border border-neutral-700 focus:border-white rounded text-sm text-white focus:outline-none"
                />
              )}

              {/* Caption Input */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Beschriftung (optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="z.B. Dark Curved Greatsword"
                  className="w-full px-3 py-2 bg-black border border-neutral-700 focus:border-white rounded text-sm text-white focus:outline-none"
                />
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Kategorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-black border border-neutral-700 focus:border-white rounded text-sm text-white focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving || !formData.imageUrl}
                className="w-full py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-neutral-200 disabled:opacity-40"
              >
                {isSaving ? "Speichere..." : "Speichern"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SIMPLE ADMIN SETTINGS MODAL */}
      {/* ========================================== */}
      {showSettingsModal && isAdmin && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-[#111] border border-white/30 rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Einstellungen
              </span>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Name oben links
                </label>
                <input
                  type="text"
                  value={settingsForm.artistName}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      artistName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-black border border-neutral-700 rounded text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Discord-Name
                </label>
                <input
                  type="text"
                  value={settingsForm.discordTag}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      discordTag: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-black border border-neutral-700 rounded text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  Neues Passwort (optional)
                </label>
                <input
                  type="password"
                  value={settingsForm.newPassword}
                  onChange={(e) =>
                    setSettingsForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Leer lassen zum Behalten"
                  className="w-full px-3 py-2 bg-black border border-neutral-700 rounded text-sm text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
              >
                Speichern
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
