import React, { useState, useEffect } from "react";
import { 
  BarChart3, FileText, ShoppingBag, Radio, Mail, ClipboardCopy, CheckCircle, 
  XSquare, Plus, Trash2, Calendar, IndianRupee, User, ShieldCheck, MailWarning, Eye, KeyRound, Image as ImageIcon, Upload, Link as LinkIcon
} from "lucide-react";
import { Post, Product, Order, PaymentSettings, SalesStats, SiteTexts } from "../types";

const compressImageBase64 = (base64Str: string, maxWidth = 600, maxHeight = 600): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

const BLOG_IMAGE_PRESETS = [
  { name: "Acoustics Foam", url: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=600&auto=format&fit=crop" },
  { name: "Mixing Desk", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop" },
  { name: "Cozy Studio", url: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=600&auto=format&fit=crop" },
  { name: "Analog Synths", url: "https://images.unsplash.com/photo-1481887328591-3e277f9473dc?q=80&w=600&auto=format&fit=crop" },
  { name: "Guitar Session", url: "https://images.unsplash.com/photo-1510915228340-29c85a43dbfe?q=80&w=600&auto=format&fit=crop" },
  { name: "Vocal Microphone", url: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop" }
];

const PRODUCT_IMAGE_PRESETS = [
  { name: "Synth Keyboard", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop" },
  { name: "Microphone Pro", url: "https://images.unsplash.com/photo-1551716673-10255306e98e?q=80&w=600&auto=format&fit=crop" },
  { name: "Waves & DAW", url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=600&auto=format&fit=crop" },
  { name: "Outboard Rack", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop" },
  { name: "Console Desk", url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop" },
  { name: "Drum Kit", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop" }
];

interface AdminPanelProps {
  posts: Post[];
  products: Product[];
  categories: string[];
  orders: Order[];
  paymentSettings: PaymentSettings;
  stats: SalesStats;
  emailLogs: any[];
  siteTexts: SiteTexts;
  customInputs?: any[];
  onUpdateCustomInputs?: (inputs: any[]) => Promise<void>;
  onAddPost: (post: { title: string; category: string; content: string; image?: string }) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onAddProduct: (product: { 
    name: string; 
    description: string; 
    price: number; 
    category: string; 
    image: string; 
    allowedCheckoutMode?: 'both' | 'direct_only' | 'chat_only';
    instagramLink?: string;
    messengerLink?: string;
    whatsAppLink?: string;
  }) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddCategory: (category: string) => Promise<void>;
  onUpdatePaymentSettings: (settings: Partial<PaymentSettings>) => Promise<void>;
  onUpdateSiteTexts: (settings: Partial<SiteTexts>) => Promise<void>;
  onVerifyOrder: (id: string, status: any) => Promise<void>;
}

export default function AdminPanel({
  posts,
  products,
  categories,
  orders,
  paymentSettings,
  stats,
  emailLogs,
  siteTexts,
  customInputs = [],
  onUpdateCustomInputs,
  onAddPost,
  onDeletePost,
  onAddProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdatePaymentSettings,
  onUpdateSiteTexts,
  onVerifyOrder
}: AdminPanelProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'posts' | 'products' | 'orders' | 'payment' | 'emails' | 'texts' | 'custom-inputs'>('analytics');

  // Form states for creating general items
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [newCat, setNewCat] = useState("");

  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodAllowedCheckoutMode, setProdAllowedCheckoutMode] = useState<'both' | 'direct_only' | 'chat_only'>('both');
  const [prodInstagramLink, setProdInstagramLink] = useState("");
  const [prodMessengerLink, setProdMessengerLink] = useState("");
  const [prodWhatsAppLink, setProdWhatsAppLink] = useState("");

  // Custom Fields parameters
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "textarea" | "file">("text");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(true);

  // Payment Setup state
  const [payActiveMethod, setPayActiveMethod] = useState<any>("");
  const [payGpayUpid, setPayGpayUpid] = useState("");
  const [payGpayName, setPayGpayName] = useState("");
  const [payBankName, setPayBankName] = useState("");
  const [payBankAccount, setPayBankAccount] = useState("");
  const [payBankIfsc, setPayBankIfsc] = useState("");
  const [payUseBackupQr, setPayUseBackupQr] = useState(true);
  const [payInstagramLink, setPayInstagramLink] = useState("");
  const [payMessengerLink, setPayMessengerLink] = useState("");
  const [payWhatsAppLink, setPayWhatsAppLink] = useState("");
  const [payEnableWhatsApp, setPayEnableWhatsApp] = useState(true);

  // Site Texts states
  const [siteBrandName, setSiteBrandName] = useState("");
  const [siteSubLabel, setSiteSubLabel] = useState("");
  const [siteHeroPill, setSiteHeroPill] = useState("");
  const [siteHeroTitle, setSiteHeroTitle] = useState("");
  const [siteHeroDescription, setSiteHeroDescription] = useState("");
  const [siteHeroButton, setSiteHeroButton] = useState("");
  const [siteFooterCopyrightName, setSiteFooterCopyrightName] = useState("");
  const [savedTextsSuccess, setSavedTextsSuccess] = useState(false);

  // Status logs
  const [submitting, setSubmitting] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Confirmation states to avoid iframe window.confirm blockages
  const [confirmingVoidOrderId, setConfirmingVoidOrderId] = useState<string | null>(null);
  const [confirmingDeletePostId, setConfirmingDeletePostId] = useState<string | null>(null);
  const [confirmingDeleteProductId, setConfirmingDeleteProductId] = useState<string | null>(null);

  // Initialize Payment Fields
  useEffect(() => {
    if (paymentSettings) {
      setPayActiveMethod(paymentSettings.activeMethod || "gpay_qr");
      setPayGpayUpid(paymentSettings.gpayUpid || "dp4737187@okicici");
      setPayGpayName(paymentSettings.gpayName || "Dayal Pal");
      setPayBankName(paymentSettings.bankName || "Reserve Credit Bank");
      setPayBankAccount(paymentSettings.bankAccount || "98765432101");
      setPayBankIfsc(paymentSettings.bankIfsc || "RCBK0001234");
      setPayUseBackupQr(paymentSettings.useBackupQr !== false);
      setPayInstagramLink(paymentSettings.instagramLink || "");
      setPayMessengerLink(paymentSettings.messengerLink || "");
      setPayWhatsAppLink(paymentSettings.whatsAppLink || "");
      setPayEnableWhatsApp(paymentSettings.enableWhatsApp !== false);
    }
  }, [paymentSettings]);

  // Initialize Site Texts Fields
  useEffect(() => {
    if (siteTexts) {
      setSiteBrandName(siteTexts.brandName || "");
      setSiteSubLabel(siteTexts.subLabel || "");
      setSiteHeroPill(siteTexts.heroPill || "");
      setSiteHeroTitle(siteTexts.heroTitle || "");
      setSiteHeroDescription(siteTexts.heroDescription || "");
      setSiteHeroButton(siteTexts.heroButton || "");
      setSiteFooterCopyrightName(siteTexts.footerCopyrightName || "");
    }
  }, [siteTexts]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    setSubmitting(true);
    try {
      await onAddPost({
        title: postTitle,
        category: postCategory || categories[0] || "General",
        content: postContent,
        image: postImage
      });
      setPostTitle("");
      setPostContent("");
      setPostCategory("");
      setPostImage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setSubmitting(true);
    try {
      await onAddCategory(newCat.trim());
      setNewCat("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) return;
    setSubmitting(true);
    try {
      await onAddProduct({
        name: prodName,
        description: prodDesc,
        price: parseFloat(prodPrice) || 0,
        category: prodCategory || categories[0] || "General",
        image: prodImage.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        allowedCheckoutMode: prodAllowedCheckoutMode,
        instagramLink: prodInstagramLink.trim(),
        messengerLink: prodMessengerLink.trim(),
        whatsAppLink: prodWhatsAppLink.trim()
      });
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      setProdCategory("");
      setProdImage("");
      setProdAllowedCheckoutMode("both");
      setProdInstagramLink("");
      setProdMessengerLink("");
      setProdWhatsAppLink("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedSettingsSuccess(false);
    try {
      await onUpdatePaymentSettings({
        activeMethod: payActiveMethod,
        gpayUpid: payGpayUpid,
        gpayName: payGpayName,
        bankName: payBankName,
        bankAccount: payBankAccount,
        bankIfsc: payBankIfsc,
        useBackupQr: payUseBackupQr,
        instagramLink: payInstagramLink,
        messengerLink: payMessengerLink,
        whatsAppLink: payWhatsAppLink,
        enableWhatsApp: payEnableWhatsApp
      });
      setSavedSettingsSuccess(true);
      setTimeout(() => setSavedSettingsSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSiteTextsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedTextsSuccess(false);
    try {
      await onUpdateSiteTexts({
        brandName: siteBrandName,
        subLabel: siteSubLabel,
        heroPill: siteHeroPill,
        heroTitle: siteHeroTitle,
        heroDescription: siteHeroDescription,
        heroButton: siteHeroButton,
        footerCopyrightName: siteFooterCopyrightName
      });
      setSavedTextsSuccess(true);
      setTimeout(() => setSavedTextsSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomFieldLocal = async () => {
    if (!newFieldName.trim()) return;
    if (onUpdateCustomInputs) {
      const fieldId = "field-" + Date.now();
      const defaultPlaceholder = newFieldType === 'file' 
        ? "Upload your screenshot proof" 
        : newFieldType === 'textarea' 
          ? "Paste your links (one per line)..." 
          : `Enter your ${newFieldName.toLowerCase()}`;
      const updated = [
        ...(customInputs || []),
        {
          id: fieldId,
          label: newFieldName.trim(),
          type: newFieldType,
          placeholder: newFieldPlaceholder.trim() || defaultPlaceholder,
          required: newFieldRequired
        }
      ];
      await onUpdateCustomInputs(updated);
      setNewFieldName("");
      setNewFieldPlaceholder("");
      setNewFieldType("text");
      setNewFieldRequired(true);
    }
  };

  const handleRemoveCustomFieldLocal = async (idOrLabel: string) => {
    if (onUpdateCustomInputs && customInputs) {
      const updated = customInputs.filter((i: any) => i.id !== idOrLabel && i.label !== idOrLabel);
      await onUpdateCustomInputs(updated);
    }
  };

  // SVG Chart Builders for pristine analytics dashboards
  const safeDailyRevenue = Array.isArray(stats?.dailyRevenue) ? stats.dailyRevenue : [];
  const safeCategorySales = Array.isArray(stats?.categorySales) ? stats.categorySales : [];

  const maxRevenue = safeDailyRevenue.length > 0 
    ? Math.max(...safeDailyRevenue.map(d => d.amount), 10) 
    : 10;

  const maxCategoryAmount = safeCategorySales.length > 0
    ? Math.max(...safeCategorySales.map(c => c.amount), 10)
    : 10;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top dashboard title row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded uppercase">
            Security Authorized Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Dayal Pal Admin Hub
          </h1>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold select-none">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Server Active
        </div>
      </div>

      {/* Admin Tab Selections */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'analytics'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics & Sales
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'orders'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders Ledger
          {stats?.pendingOrders > 0 && (
            <span className="ml-1 w-4.5 h-4.5 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {stats.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'posts'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Journal & Blog Editor
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'products'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Store Products & Prices
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'payment'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <Radio className="w-4 h-4" />
          Payment modes
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'emails'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Notifiers
        </button>

        <button
          onClick={() => setActiveTab('texts')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'texts'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <ClipboardCopy className="w-4 h-4" />
          Customize Site Text
        </button>

        <button
          onClick={() => setActiveTab('custom-inputs')}
          className={`px-4.5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition ${
            activeTab === 'custom-inputs'
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          Checkout Dynamic Inputs
        </button>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      
      {/* 1. ANALYTICS & SALES CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Bento Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Verified Revenue</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">₹{stats?.totalSales?.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Gross Orders Submitted</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Awaiting Verification</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.pendingOrders}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Verified Transactions</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats?.verifiedOrders}</p>
              </div>
            </div>
          </div>

          {/* Graphical Analytics charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Trend chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Daily Revenue Timeline</h3>
                <span className="text-[10px] font-mono text-slate-400 font-medium">Verified USD Ledger</span>
              </div>

              {safeDailyRevenue.length === 0 ? (
                <div className="h-48 flex items-center justify-center border border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No verified sales coordinates registered yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Custom SVG line-trend chart */}
                  <div className="relative h-44 w-full flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Reference grids lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                      <line x1="0" y1="70" x2="400" y2="70" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
                      <line x1="0" y1="110" x2="400" y2="110" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-700/60" />

                      {/* Area Fill */}
                      <path
                        d={`M 0,110 ${safeDailyRevenue.map((d, i) => {
                          const x = (i / Math.max(safeDailyRevenue.length - 1, 1)) * 400;
                          const y = 110 - (d.amount / maxRevenue) * 90;
                          return `L ${x},${y}`;
                        }).join(" ")} L 400,110 Z`}
                        fill="url(#chartGrad)"
                      />

                      {/* Main Spark Line */}
                      <path
                        d={safeDailyRevenue.map((d, i) => {
                          const x = (i / Math.max(safeDailyRevenue.length - 1, 1)) * 400;
                          const y = 110 - (d.amount / maxRevenue) * 90;
                          return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                      />

                      {/* Dot highlight points */}
                      {safeDailyRevenue.map((d, i) => {
                        const x = (i / Math.max(safeDailyRevenue.length - 1, 1)) * 400;
                        const y = 110 - (d.amount / maxRevenue) * 90;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between text-[10px] font-mono font-medium text-slate-400">
                    <span>{safeDailyRevenue[0]?.date}</span>
                    <span>{safeDailyRevenue[Math.floor(safeDailyRevenue.length / 2)]?.date}</span>
                    <span>{safeDailyRevenue[safeDailyRevenue.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category breakdown bar charts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Sales by Item Category</h3>

              {safeCategorySales.length === 0 ? (
                <div className="h-48 flex items-center justify-center border border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No categorical sales recorded yet.
                </div>
              ) : (
                <div className="h-48 flex flex-col justify-between">
                  <div className="space-y-3.5 mt-2">
                    {safeCategorySales.map((c, i) => {
                      const perc = Math.round((c.amount / maxCategoryAmount) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-sans">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{c.category}</span>
                            <span className="font-mono font-bold text-slate-950 dark:text-slate-100">₹{c.amount?.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full rounded-full" 
                              style={{ width: `${perc}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS TRACKING LEDGER */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Order verification queue</h3>
            <span className="text-[10px] font-mono text-slate-400">{orders.length} orders total</span>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs font-sans">
                No orders have been submitted yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 font-sans">
                    <th className="px-5 py-3">Order Code</th>
                    <th className="px-5 py-3">Customer details</th>
                    <th className="px-5 py-3">Purchased Items</th>
                    <th className="px-5 py-3">UTR / Transaction ID</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3 text-right">Workflow Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/40 font-sans">
                      <td className="px-5 py-4.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                        {ord.id}
                        <p className="text-[9px] text-slate-400 font-normal">{new Date(ord.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-4.5 font-sans space-y-0.5 max-w-[240px]">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {ord.customerName}
                        </div>
                        <p className="text-[10px] text-slate-400 select-all font-mono">{ord.customerEmail}</p>
                        {ord.customerPhone && <p className="text-[9px] text-slate-400">{ord.customerPhone}</p>}
                        {ord.customFields && Object.keys(ord.customFields).length > 0 && (
                          <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Submitted Info:</p>
                            {Object.entries(ord.customFields).map(([label, value]) => {
                              if (!value) return null;
                              const isImage = typeof value === "string" && value.startsWith("data:image/");
                              return (
                                <div key={label} className="text-[10.5px] leading-relaxed">
                                  <span className="font-bold text-slate-400 dark:text-slate-500 block">{label}:</span>
                                  {isImage ? (
                                    <div className="mt-1">
                                      <a href={value} target="_blank" rel="noreferrer" className="inline-block p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition">
                                        <img src={value} alt={label} className="h-10 w-10 object-cover rounded" />
                                      </a>
                                      <span className="text-[9px] text-indigo-500 block mt-0.5">Click to view screen</span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200 break-all select-all whitespace-pre-wrap">{value}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4.5 font-sans font-medium space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="text-slate-700 dark:text-slate-300">
                            {it.name} <span className="text-indigo-600 font-mono text-[10px]/none">x{it.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4.5 font-sans">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-sans">UTR / Ref ID</span>
                          <div className="p-1.5 px-3 bg-indigo-50 dark:bg-slate-800 border border-indigo-200/30 dark:border-slate-700/50 rounded-xl text-xs text-indigo-950 dark:text-indigo-300 font-bold font-mono max-w-[210px] break-all select-all flex items-center justify-between shadow-sm">
                            <span>{ord.paymentDetails?.transactionId || "N/A"}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-tight mt-1">{ord.paymentMethodUsed}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4.5 font-extrabold text-slate-900 dark:text-slate-100 font-sans">
                        ₹{ord.total?.toFixed(2)}
                      </td>
                      <td className="px-5 py-4.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={(ord.status as any) === "Verified" ? "Completed" : ord.status}
                            onChange={(e) => onVerifyOrder(ord.id, e.target.value as any)}
                            className={`text-[11px] font-extrabold uppercase tracking-wide px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition cursor-pointer ${
                              ord.status === "Pending"
                                ? "bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border-amber-500/20"
                                : ord.status === "In Progress"
                                ? "bg-indigo-550/10 hover:bg-indigo-550/15 text-indigo-650 border-indigo-500/20"
                                : ord.status === "Completed" || (ord.status as any) === "Verified"
                                ? "bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                                : "bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 border-rose-500/20"
                            }`}
                          >
                            <option value="Pending">🕒 Pending</option>
                            <option value="In Progress">⚙️ In Progress</option>
                            <option value="Completed">✅ Completed</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTENT MANAGER: WRITE AND REMOVE BLOG POSTS */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Creator panel side form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-500">Draft New Journal Post</h3>

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="The aesthetics of dynamic compressors..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category Selection</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Cover Image Picker widget */}
              <div className="space-y-2 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850 p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Cover Image
                  </label>
                  {postImage && (
                    <button
                      type="button"
                      onClick={() => setPostImage("")}
                      className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {/* URL Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="url"
                    placeholder="Paste Unsplash or custom image URL..."
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                  />
                </div>

                {/* File Upload Zone */}
                <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-indigo-500">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold">Upload Local File</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                          if (typeof ev.target?.result === "string") {
                            const compressed = await compressImageBase64(ev.target.result);
                            setPostImage(compressed);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Preview block */}
                {postImage && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-16 flex items-center justify-center">
                    <img
                      src={postImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 right-1 bg-slate-900/75 text-white rounded p-0.5 px-1.5 text-[8px] font-mono leading-none scale-90">
                      {postImage.startsWith("data:") ? "Local Compressed File" : "Remote URL"}
                    </div>
                  </div>
                )}

                {/* Preset thumbnails */}
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aesthetic Presets:</p>
                  <div className="grid grid-cols-6 gap-1">
                    {BLOG_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPostImage(preset.url)}
                        title={preset.name}
                        className={`relative h-6 rounded overflow-hidden border transition active:scale-95 cursor-pointer ${
                          postImage === preset.url ? "border-indigo-600 ring-2 ring-indigo-500/25" : "border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Main Prose Draft</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Input deep, informative technical prose. Support Markdown if possible..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold tracking-wide uppercase cursor-pointer transition disabled:opacity-50"
              >
                Publish New Entry
              </button>
            </form>

            {/* Quick add category section */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Register New Category</h4>
              <form onSubmit={handleCategorySubmit} className="flex gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mixing Secrets"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="p-1 px-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Active lists */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Live journal timeline</h3>

            <div className="space-y-3.5">
              {posts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs font-sans">
                  No active posts listed. Draft one on the left!
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between bg-slate-50/60 dark:bg-slate-850 p-4 border border-slate-150/50 dark:border-slate-800/70 rounded-xl gap-4">
                    <div className="flex gap-4 items-start min-w-0 flex-1">
                      {post.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/60 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center select-none">
                          <img
                            src={post.image}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString()}</span>
                          <span className="bg-indigo-100/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded leading-none text-[8px] font-bold uppercase">{post.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{post.title}</h4>
                        <p className="text-xs text-slate-500 font-sans line-clamp-2">{post.content}</p>
                      </div>
                    </div>

                    {confirmingDeletePostId === post.id ? (
                      <div className="flex items-center gap-1.5 shrink-0 font-sans">
                        <button
                          onClick={() => {
                            onDeletePost(post.id);
                            setConfirmingDeletePostId(null);
                          }}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] uppercase cursor-pointer transition shadow-sm"
                        >
                          Confirm Delete?
                        </button>
                        <button
                          onClick={() => setConfirmingDeletePostId(null)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeletePostId(post.id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PRODUCT STORE MANAGER */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-4 text-xs font-sans">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-500">Draft New Store Product</h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Exclusive Beat Pack (Vol. 2)..."
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.99"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category Tag</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Cover Image Picker widget */}
              <div className="space-y-2 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-3 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Product Image
                  </label>
                  {prodImage && (
                    <button
                      type="button"
                      onClick={() => setProdImage("")}
                      className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {/* URL Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="url"
                    placeholder="Paste Unsplash or custom product image URL..."
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                  />
                </div>

                {/* File Upload Zone */}
                <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-indigo-500">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-semibold">Upload Local File</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                          if (typeof ev.target?.result === "string") {
                            const compressed = await compressImageBase64(ev.target.result);
                            setProdImage(compressed);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Preview block */}
                {prodImage && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-16 flex items-center justify-center">
                    <img
                      src={prodImage}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 right-1 bg-slate-900/75 text-white rounded p-0.5 px-1.5 text-[8px] font-mono leading-none scale-90">
                      {prodImage.startsWith("data:") ? "Local Compressed File" : "Remote URL"}
                    </div>
                  </div>
                )}

                {/* Preset thumbnails */}
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aesthetic Presets:</p>
                  <div className="grid grid-cols-6 gap-1">
                    {PRODUCT_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProdImage(preset.url)}
                        title={preset.name}
                        className={`relative h-6 rounded overflow-hidden border transition active:scale-95 cursor-pointer ${
                          prodImage === preset.url ? "border-indigo-600 ring-2 ring-indigo-500/25" : "border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Marketing Description</label>
                <textarea
                  rows={4}
                  placeholder="Include details about content sizes, WAV stems depth, and licensing agreements."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Checkout Channel Control */}
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 p-3 rounded-2xl space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Allowed Payment / Checkout Method</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-sans text-[11px] text-slate-600 dark:text-slate-300">
                    <input 
                      type="radio" 
                      name="allowedCheckoutMode" 
                      value="both" 
                      checked={prodAllowedCheckoutMode === 'both'} 
                      onChange={() => setProdAllowedCheckoutMode('both')} 
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Both Direct Pay & Chat Redirection</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-sans text-[11px] text-slate-600 dark:text-slate-300">
                    <input 
                      type="radio" 
                      name="allowedCheckoutMode" 
                      value="chat_only" 
                      checked={prodAllowedCheckoutMode === 'chat_only'} 
                      onChange={() => setProdAllowedCheckoutMode('chat_only')} 
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">Social Chat Redirection ONLY (Special Product)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-sans text-[11px] text-slate-600 dark:text-slate-300">
                    <input 
                      type="radio" 
                      name="allowedCheckoutMode" 
                      value="direct_only" 
                      checked={prodAllowedCheckoutMode === 'direct_only'} 
                      onChange={() => setProdAllowedCheckoutMode('direct_only')} 
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Direct Pay / UPI ONLY</span>
                  </label>
                </div>
              </div>

              {/* Product-level Custom Messaging Links */}
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800/80 p-3 rounded-2xl space-y-3">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block uppercase tracking-wide">Dynamic Product Chat Links (Optional override)</span>
                
                <div className="space-y-2 font-sans text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Instagram Direct DM Link:</label>
                    <input
                      type="url"
                      placeholder="e.g. https://instagram.com/direct/t/yourusername"
                      value={prodInstagramLink}
                      onChange={(e) => setProdInstagramLink(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Facebook Messenger Link:</label>
                    <input
                      type="url"
                      placeholder="e.g. https://m.me/yourpageid"
                      value={prodMessengerLink}
                      onChange={(e) => setProdMessengerLink(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">WhatsApp Direct Chat Link:</label>
                    <input
                      type="url"
                      placeholder="e.g. https://wa.me/911234567890?text=I'm%20interested"
                      value={prodWhatsAppLink}
                      onChange={(e) => setProdWhatsAppLink(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold tracking-wide uppercase cursor-pointer transition disabled:opacity-50"
              >
                Create Product Item
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Live products inventory</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((prod) => (
                <div key={prod.id} className="bg-slate-50/60 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="flex gap-4 p-3 items-start">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-14 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-950 dark:text-slate-100 truncate">{prod.name}</h4>
                      <p className="text-[10px] font-mono text-indigo-500 font-bold">₹{prod.price?.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 truncate">{prod.description}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(!prod.allowedCheckoutMode || prod.allowedCheckoutMode === 'both') && (
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Both Checkout Options</span>
                        )}
                        {prod.allowedCheckoutMode === 'chat_only' && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-655 dark:text-amber-450 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Chat Redirect Only 💬</span>
                        )}
                        {prod.allowedCheckoutMode === 'direct_only' && (
                          <span className="text-[8px] bg-sky-500/10 text-sky-620 dark:text-sky-400 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">Direct Pay Only 💳</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 px-3.5 py-2.5">
                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-slate-400">{prod.category}</span>
                    {confirmingDeleteProductId === prod.id ? (
                      <div className="flex items-center gap-1 font-sans">
                        <button
                          onClick={() => {
                            onDeleteProduct(prod.id);
                            setConfirmingDeleteProductId(null);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold uppercase cursor-pointer transition whitespace-nowrap"
                        >
                          Delete?
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteProductId(null)}
                          className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[9px] font-bold uppercase cursor-pointer transition"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeleteProductId(prod.id)}
                        className="p-1 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. DYNAMIC CUSTOM PAYMENT CONFIGURATIONS */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 tracking-tight">Active Payments Panel Settings</h3>
              <p className="text-xs text-slate-500">Configure core values for user checkout modes instantly. You can rotate VPA handles, account specifics, or switch payment systems.</p>
            </div>

            {savedSettingsSuccess && (
              <div className="flex gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl items-start text-emerald-800 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-xs font-sans leading-normal font-medium">Payment configurations saved successfully! Changes are instantly distributed to standard customer checkouts.</span>
              </div>
            )}

            <form onSubmit={handlePaymentSettingsUpdate} className="space-y-4 text-xs font-sans select-none">
              
              {/* Option tab selection active */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Active Prime Payment Mode Offered to Readers</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl font-bold uppercase tracking-wider text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPayActiveMethod("gpay_qr")}
                    className={`py-2 px-1 rounded-lg text-center cursor-pointer transition ${
                      payActiveMethod === "gpay_qr" 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Google Pay QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayActiveMethod("upi")}
                    className={`py-2 px-1 rounded-lg text-center cursor-pointer transition ${
                      payActiveMethod === "upi" 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    UPI Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayActiveMethod("bank")}
                    className={`py-2 px-1 rounded-lg text-center cursor-pointer transition ${
                      payActiveMethod === "bank" 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400 hover:text-slate-800"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* UPI fields */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-4">
                <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">GPay & UPI Parameters</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">UPI Payee ID (VPA)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. dp4737187@okicici"
                      value={payGpayUpid}
                      onChange={(e) => setPayGpayUpid(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">merchant display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dayal Pal"
                      value={payGpayName}
                      onChange={(e) => setPayGpayName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Transfer details */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-4">
                <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">Direct Bank Wire parameters</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      placeholder="Reserve Credit Bank"
                      value={payBankName}
                      onChange={(e) => setPayBankName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Account Number</label>
                    <input
                      type="text"
                      placeholder="98765432101"
                      value={payBankAccount}
                      onChange={(e) => setPayBankAccount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">IFSC Routing Code</label>
                    <input
                      type="text"
                      placeholder="RCBK0001234"
                      value={payBankIfsc}
                      onChange={(e) => setPayBankIfsc(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle switch Backup QR Pay */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">Enable Google Pay QR Backup Payment</span>
                  <span className="text-[10.5px] text-slate-400 block mt-0.5">Allows Checkout fallback options rendering precisely our Dayal Pal QR card template.</span>
                </div>
                <input
                  type="checkbox"
                  checked={payUseBackupQr}
                  onChange={(e) => setPayUseBackupQr(e.target.checked)}
                  className="w-5.5 h-5.5 text-indigo-600 focus:ring-indigo-500 rounded cursor-pointer"
                />
              </div>

              {/* Social Channels chat links parameters */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-4">
                <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">Social Chat Direct redirection links</h4>
                
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Configure direct messaging links (WhatsApp, Instagram, and Facebook Messenger). If provided, customers during checkout can choose to connect directly with you via these links to place their orders over chat!
                </p>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Instagram DM Link (or Full URL)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://instagram.com/dayal_pal"
                      value={payInstagramLink}
                      onChange={(e) => setPayInstagramLink(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Facebook Messenger Link (or Full URL)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://m.me/dayal_pal"
                      value={payMessengerLink}
                      onChange={(e) => setPayMessengerLink(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">WhatsApp Redirection Option</span>
                      <button
                        type="button"
                        onClick={() => setPayEnableWhatsApp(!payEnableWhatsApp)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                          payEnableWhatsApp
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-800"
                        }`}
                      >
                        {payEnableWhatsApp ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                    {payEnableWhatsApp && (
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 block">WhatsApp Link (or wa.me/Number)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://wa.me/911234567890"
                          value={payWhatsAppLink}
                          onChange={(e) => setPayWhatsAppLink(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  {submitting ? "Saving..." : "Distribute configurations"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Live configuration audit</h3>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/25 rounded-2xl border border-indigo-100/40 border-dashed space-y-4 text-xs font-sans">
                <span className="font-bold uppercase tracking-wider block text-indigo-800 dark:text-indigo-300">Reader checkout preview:</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px]">Primary Active:</span>
                    <span className="font-bold text-indigo-600 font-mono text-[11px] uppercase">{payActiveMethod}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px]">payee UPI VPA:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-[11px] truncate max-w-[130px]">{payGpayUpid}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px]">Payee Bank Account:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-mono text-[11px]">{payBankAccount ? "Active Secure" : "Inactive Setup"}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px]">Google Pay Backup Card:</span>
                    <span className={`font-bold font-mono text-[11px] ${payUseBackupQr ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {payUseBackupQr ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px]">Active Chat Redirects:</span>
                    <span className="font-bold text-indigo-600 font-mono text-[11px]">
                      {[(payEnableWhatsApp ? payWhatsAppLink : ""), payInstagramLink, payMessengerLink].filter(link => !!link?.trim()).length} Channels
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl text-[10px] leading-relaxed text-slate-500 flex gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                All active settings write straight to database stores. Security audits run automatically on node reload.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. OUTBOUND sim EMAIL LOGS */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 p-4.5 rounded-2xl flex gap-3 text-xs leading-normal">
            <MailWarning className="w-5.5 h-5.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
            <div>
              <span className="font-bold block">Secure Back-End Mail Dispatcher Active</span>
              <span className="block mt-1 font-sans">
                Each payment transaction generates an outbound notification securely on the server with full purchase breakdowns. To hide this address from readers, all SMTP routing occurs server-side. The dispatcher targets <strong className="underline text-indigo-600 dark:text-indigo-400">beatbounce181@gmail.com</strong> securely. Users have zero visibility of this backend email process!
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Back-End Dispatch Logs (Auditable)</h3>
              <span className="text-[10px] font-mono text-slate-400">{emailLogs.length} simulated dispatches</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {emailLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs font-sans">
                  No notifications have been dispatched yet. Register checkouts to audit mailers.
                </div>
              ) : (
                emailLogs.map((log) => (
                  <div key={log.id} className="p-5 space-y-3 font-mono text-xs dark:text-slate-300">
                    <div className="flex flex-wrap justify-between items-center text-[10.5px] border-b border-slate-100 dark:border-slate-800/80 pb-2">
                      <span className="text-slate-400">TIMESTAMP: <strong className="text-slate-700 dark:text-slate-200">{new Date(log.timestamp).toLocaleString()}</strong></span>
                      <span className="text-slate-400">TARGET: <strong className="text-indigo-600 dark:text-indigo-400 underline select-all select-none">beatbounce181@gmail.com</strong></span>
                    </div>

                    <div className="space-y-1 pt-1 font-sans">
                      <p className="text-xs text-slate-800 dark:text-white"><span className="font-bold font-mono text-[10px] text-slate-400 mr-2 uppercase">SUBJECT:</span>{log.subject}</p>
                    </div>

                    <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl leading-relaxed text-[10.5px]/5 font-mono text-slate-700 dark:text-slate-300 max-h-56 overflow-auto scrollbar-thin select-all">
                      {log.body}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. EDIT DYNAMIC SITE TEXTS */}
      {activeTab === 'texts' && (
        <form onSubmit={handleSiteTextsUpdate} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-500">Edit Custom Site Branding & Slogans</h3>
              <p className="text-xs text-slate-400 mt-1">Updates titles, subtitles, banner blurbs, and buttons across all pages instantly.</p>
            </div>

            {savedTextsSuccess && (
              <div className="flex gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl items-center text-emerald-700 dark:text-emerald-400 text-xs shadow-sm">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="font-semibold font-sans">Dynamic site texts successfully saved and published!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BRANDING SECTION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-l-2 border-indigo-500 pl-2">Navigation & Header Labels</h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Brand Author Name</label>
                  <input
                    type="text"
                    required
                    value={siteBrandName}
                    onChange={(e) => setSiteBrandName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Dayal Pal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Brand Sub-Label</label>
                  <input
                    type="text"
                    required
                    value={siteSubLabel}
                    onChange={(e) => setSiteSubLabel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Aesthetics journal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Footer Copyright Entity</label>
                  <input
                    type="text"
                    required
                    value={siteFooterCopyrightName}
                    onChange={(e) => setSiteFooterCopyrightName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Dayal Pal"
                  />
                </div>
              </div>

              {/* HERO BANNER SECTION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-l-2 border-indigo-500 pl-2">Creative Hub Hero Banner (Journal)</h4>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Hero Pill-Badge</label>
                  <input
                    type="text"
                    required
                    value={siteHeroPill}
                    onChange={(e) => setSiteHeroPill(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Creative Hub & Journal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Hero Display Title</label>
                  <input
                    type="text"
                    required
                    value={siteHeroTitle}
                    onChange={(e) => setSiteHeroTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Fresh Audio Formulae & Production Aesthetics"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Hero Shop Button Label</label>
                  <input
                    type="text"
                    required
                    value={siteHeroButton}
                    onChange={(e) => setSiteHeroButton(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Browse Production Shop"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">Hero Description Blurb</label>
              <textarea
                required
                rows={3}
                value={siteHeroDescription}
                onChange={(e) => setSiteHeroDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 ::border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans"
                placeholder="Write description/intro details..."
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition disabled:opacity-50"
              >
                {submitting ? "Publishing updates..." : "Save & Publish Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 8. CHECKOUT CUSTOM INPUTS CONFIGURATION */}
      {activeTab === 'custom-inputs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <User className="w-5 h-5 text-indigo-500" />
              Dynamic Checkout Inputs & Screenshot Proofs
            </h3>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Define the inputs or file uploads you require from customers before they check out (for example: payment screenshot proof, social account links, customized specifications). These inputs are gathered securely during checkout and displayed in your Admin Analytics ledger.
            </p>
          </div>

          {/* Form to add a new custom field */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70 p-5 rounded-2xl space-y-4 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Create New Checkout Input Field</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="col-span-1 md:col-span-3 space-y-1 text-xs flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Field Label / Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction Screenshot"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="col-span-1 md:col-span-3 space-y-1 text-xs flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Field Type</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="text">Short Text (e.g. Username/Link)</option>
                  <option value="textarea">Long Text / Multiple Links</option>
                  <option value="file">File / Screenshot Proof Uploader</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-3 space-y-1 text-xs flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Custom Placeholder (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty for generic help texts"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="col-span-1 md:col-span-3 flex items-center justify-between h-10 pb-1 pr-1 pl-1 gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-350 dark:border-slate-700 rounded focus:ring-indigo-500"
                  />
                  <span>Required</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddCustomFieldLocal}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow cursor-pointer font-sans shrink-0"
                >
                  Create Field
                </button>
              </div>
            </div>
          </div>

          {/* List of active custom fields */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Currently Configured Checkout Fields</h4>
            {customInputs && customInputs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-2">
                <p className="text-xs text-slate-400 font-sans italic font-medium">No custom checkout fields configured. Only Name, Email, and Phone will be requested.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customInputs && customInputs.map((input: any) => (
                  <div key={input.id || input.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/70 p-4.5 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-500/30 transition">
                    <div className="space-y-1 font-sans text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-950 dark:text-slate-200 text-sm">{input.label}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 rounded-full text-[9px] font-bold uppercase tracking-wide">
                          {input.type === 'file' ? 'Screenshot Uploader' : input.type === 'textarea' ? 'Text Area (Links)' : 'Short Text'}
                        </span>
                        {input.required && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-rose-100 dark:bg-rose-950/45 text-rose-600 dark:text-rose-400">Required</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">Placeholder help text: <strong className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 dark:text-slate-300">{input.placeholder || "None"}</strong></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomFieldLocal(input.id || input.label)}
                      className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
