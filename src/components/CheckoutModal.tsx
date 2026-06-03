import React, { useState, useEffect } from "react";
import { X, Lock, CheckCircle, Smartphone, Landmark, AlertCircle, ShoppingBag, Clipboard, Check, Upload, Image, RefreshCw, Clock, Hourglass } from "lucide-react";
import { PaymentSettings } from "../types";
import { CartItem } from "./ShopView";
import GPayCardUI from "./GPayCardUI";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  paymentSettings: PaymentSettings;
  customInputs?: any[];
  onTrackOrder?: (orderId: string) => void;
  currentUser?: any;
  onSubmitOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethodUsed: string;
    transactionId: string;
    bankName?: string;
    customFields?: Record<string, string>;
  }) => Promise<{ id: string } | null>;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  paymentSettings,
  customInputs = [],
  onSubmitOrder,
  onTrackOrder,
  currentUser
}: CheckoutModalProps) {
  const total = cart ? cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) : 0;
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Customer form details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  // Payment declaration
  const [selectedMethod, setSelectedMethod] = useState<string>("gpay_qr");
  const [transactionId, setTransactionId] = useState("");
  const [bankName, setBankName] = useState(""); // optional for bank method

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [placedOrderReference, setPlacedOrderReference] = useState<string | null>(null);
  const [verificationStage, setVerificationStage] = useState<string>("");

  // Streams choice: online ledger vs manual chat redirection
  const [checkoutStream, setCheckoutStream] = useState<'instant' | 'chat'>('instant');
  const [selectedChatChannel, setSelectedChatChannel] = useState<'whatsapp' | 'instagram' | 'messenger'>('whatsapp');

  // Clipboard copies helper
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Determine checkout restrictions based on items in the cart
  const hasChatOnlyItems = cart ? cart.some(item => item.product.allowedCheckoutMode === 'chat_only') : false;
  const hasDirectOnlyItems = cart ? cart.some(item => item.product.allowedCheckoutMode === 'direct_only') : false;

  const forceChatRedirect = hasChatOnlyItems;
  const forceDirectPay = hasDirectOnlyItems && !hasChatOnlyItems;

  // Reset checkout modal state completely when initialized/opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTransactionId("");
      setPlacedOrderReference(null);
      setErrorText("");
      setLoading(false);
      setVerificationStage("");
      
      if (hasChatOnlyItems) {
        setCheckoutStream("chat");
      } else {
        setCheckoutStream("instant");
      }
      
      const hasWhatsApp = paymentSettings.enableWhatsApp !== false && !!(paymentSettings.whatsAppLink || (cart && cart.some(item => item.product.whatsAppLink)));
      const hasInstagram = !!(paymentSettings.instagramLink || (cart && cart.some(item => item.product.instagramLink)));
      const hasMessenger = !!(paymentSettings.messengerLink || (cart && cart.some(item => item.product.messengerLink)));

      if (hasWhatsApp) {
        setSelectedChatChannel("whatsapp");
      } else if (hasInstagram) {
        setSelectedChatChannel("instagram");
      } else if (hasMessenger) {
        setSelectedChatChannel("messenger");
      } else {
        setSelectedChatChannel("instagram");
      }
      
      if (currentUser) {
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
      } else {
        setName("");
        setEmail("");
      }
    }
  }, [isOpen, currentUser, hasChatOnlyItems, paymentSettings, cart]);

  // Keep state matching constraints when cart changes
  useEffect(() => {
    if (forceChatRedirect) {
      setCheckoutStream("chat");
    } else if (forceDirectPay) {
      setCheckoutStream("instant");
    }
  }, [forceChatRedirect, forceDirectPay]);

  if (!isOpen) return null;

  const triggerCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(label);
    setTimeout(() => setCopiedValue(null), 1800);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorText("Name and Email are required to proceed securely.");
      return;
    }
    // Validate required custom fields (e.g. Discord handle, Instagram username)
    if (customInputs) {
      for (const input of customInputs) {
        if (input.required && !customFields[input.label]?.trim()) {
          setErrorText(`Please fill out the required field: ${input.label}`);
          return;
        }
      }
    }
    setErrorText("");
    setStep(2);
    // Set initial payment method based on admin configurations
    if (paymentSettings.activeMethod) {
      setSelectedMethod(paymentSettings.activeMethod);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!transactionId.trim()) {
      setErrorText("A valid Payment Transaction / Reference ID is required to secure checkout.");
      return;
    }

    setLoading(true);
    try {
      setVerificationStage("Placing secure order...");
      await new Promise((r) => setTimeout(r, 400));

      // Create readable description label for selected method
      let methodLabel = "Google Pay UPI";
      if (selectedMethod === "gpay_qr") {
        methodLabel = `Google Pay QR Code (${paymentSettings.gpayName})`;
      } else if (selectedMethod === "upi") {
        methodLabel = `UPI Address (${paymentSettings.gpayUpid})`;
      } else if (selectedMethod === "bank") {
        methodLabel = `Direct Bank Transfer (${paymentSettings.bankName})`;
      } else if (selectedMethod === "backup") {
        methodLabel = "Backup Google Pay QR Card";
      }

      const res = await onSubmitOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethodUsed: methodLabel,
        transactionId: transactionId.trim(),
        bankName: selectedMethod === "bank" ? bankName : undefined,
        customFields: customFields
      });

      if (res) {
        setPlacedOrderReference(res.id);
        setStep(3);
      }
    } catch (err: any) {
      setErrorText(err.message || "Failed to process the checkout. Check your connection or verify you haven't re-used a transaction ID.");
    } finally {
      setLoading(false);
      setVerificationStage("");
    }
  };

  const getWhatsAppUrl = () => {
    const itemWithCustom = cart ? cart.find((item) => item.product.whatsAppLink) : null;
    let link = itemWithCustom?.product.whatsAppLink || paymentSettings.whatsAppLink || "";
    if (!link) return "";
    
    const itemsText = cart.map((item) => `${item.product.name} (x${item.quantity})`).join(", ");
    const customFieldsText = Object.entries(customFields)
      .filter(([_, v]) => typeof v === "string" && !v.startsWith("data:image"))
      .map(([k, v]) => `${k}: ${v}`).join(", ");
    const preFilledMsg = `Hi Dayal! I want to confirm my Chat Order.\n\nItems: ${itemsText}\nTotal Price: ₹${total.toFixed(2)}\nCustomer Name: ${name}\nEmail: ${email}\n${customFieldsText ? `Details: ${customFieldsText}\n` : ''}`;
    
    const encodedText = encodeURIComponent(preFilledMsg);
    
    const cleanPhone = link.replace(/[^\d+]/g, "");
    if (cleanPhone && !link.includes("http")) {
      return `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodedText}`;
    }
    
    if (link.includes("wa.me")) {
      if (!link.includes("?text=") && !link.includes("&text=")) {
        const sep = link.includes("?") ? "&" : "?";
        return `${link}${sep}text=${encodedText}`;
      }
      return link;
    }
    
    if (link.startsWith("http")) {
      return link;
    }
    
    return `https://wa.me/${link}?text=${encodedText}`;
  };

  const getInstagramUrl = () => {
    const itemWithCustom = cart ? cart.find((item) => item.product.instagramLink) : null;
    let link = itemWithCustom?.product.instagramLink || paymentSettings.instagramLink || "";
    if (!link) return "";
    if (link.startsWith("http")) return link;
    if (!link.includes("/")) {
      return `https://instagram.com/${link.replace("@", "")}`;
    }
    return link;
  };

  const getMessengerUrl = () => {
    const itemWithCustom = cart ? cart.find((item) => item.product.messengerLink) : null;
    let link = itemWithCustom?.product.messengerLink || paymentSettings.messengerLink || "";
    if (!link) return "";
    if (link.startsWith("http")) return link;
    if (!link.includes("/")) {
      return `https://m.me/${link}`;
    }
    return link;
  };

  const handleChatCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setLoading(true);
    setVerificationStage("Redirecting to Creator chat...");
    try {
      await new Promise((r) => setTimeout(r, 500));

      const selectedLink = 
        selectedChatChannel === "whatsapp" ? getWhatsAppUrl() :
        selectedChatChannel === "instagram" ? getInstagramUrl() :
        getMessengerUrl();

      const res = await onSubmitOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethodUsed: `Direct Chat Redirect (${selectedChatChannel.toUpperCase()})`,
        transactionId: `CHAT-${selectedChatChannel.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-6)}`,
        customFields: {
          ...customFields,
          checkout_redirect_link: selectedLink,
          checkout_channel: selectedChatChannel
        }
      });

      if (res) {
        setPlacedOrderReference(res.id);
        if (selectedLink) {
          try {
            window.open(selectedLink, "_blank", "noopener,noreferrer");
          } catch (openErr) {
            console.error("Window open blocked by browser pop-up blocker", openErr);
          }
        }
        setStep(3);
      }
    } catch (err: any) {
      setErrorText(err.message || "Failed to process chat order. Please inspect connection.");
    } finally {
      setLoading(false);
      setVerificationStage("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header banner */}
        <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {step === 3 ? "Order Completed" : `Secure Checkout - Step ${step} of 2`}
            </h2>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Progression status indicator */}
        {step !== 3 && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
            <div className={`h-full bg-indigo-600 transition-all duration-300 ${step === 1 ? "w-1/2" : "w-full"}`} />
          </div>
        )}

        {/* Modal Main container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorText && (
            <div className="flex gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs text-red-800 dark:text-red-400 font-sans leading-normal font-medium">{errorText}</p>
            </div>
          )}

          {/* STEP 1: Enter customer details */}
          {step === 1 && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Who is placing this order?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  We require this information to deliver the content immediately on successful payment verification.
                </p>
              </div>

              {/* Order total info box */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/60 dark:border-indigo-950/40 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Purchase Total:</span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+15550192 (or UPI registered phone number)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {customInputs && customInputs.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 pb-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 font-sans">Required Details for Digital Full Content Delivery</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customInputs.map((input: any) => {
                      const value = customFields[input.label] || "";
                      const isImageValue = typeof value === "string" && value.startsWith("data:image/");

                      return (
                        <div key={input.id || input.label} className="space-y-1.5 col-span-1 sm:col-span-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-sans">
                              {input.type === 'file' && <Image className="w-3.5 h-3.5 text-indigo-500" />}
                              {input.label}
                            </span>
                            {input.required ? (
                              <span className="text-[10px] text-red-500 font-bold uppercase">Required *</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Optional</span>
                            )}
                          </label>

                          {input.type === 'file' ? (
                            <div className="space-y-2 font-sans col-span-1 sm:col-span-2">
                              {isImageValue ? (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3 animate-fade-in shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0">
                                      <img src={value} alt="Preview screenshot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-xs">
                                      <p className="font-bold text-slate-800 dark:text-slate-100">Screenshot Attached</p>
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Saved & ready to send with order</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCustomFields(prev => {
                                      const updated = { ...prev };
                                      delete updated[input.label];
                                      return updated;
                                    })}
                                    className="px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-xl transition text-[11px] font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 rounded-2xl transition overflow-hidden">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    required={input.required && !value}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          setErrorText(`Screenshot error: exceeds 5MB size limit.`);
                                          return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          if (typeof reader.result === 'string') {
                                            setCustomFields(prev => ({
                                              ...prev,
                                              [input.label]: reader.result as string
                                            }));
                                            setErrorText("");
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className="p-5 text-center space-y-1.5 pointer-events-none">
                                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                                      <Upload className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        Drag & drop or <span className="text-indigo-600 dark:text-indigo-400 underline">browse screenshot</span>
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                                        {input.placeholder || "PNG, JPG/JPEG (Max 5MB)"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : input.type === 'textarea' ? (
                            <textarea
                              required={input.required}
                              placeholder={input.placeholder}
                              value={value}
                              onChange={(e) => setCustomFields(prev => ({ ...prev, [input.label]: e.target.value }))}
                              rows={3}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans resize-none leading-relaxed"
                            />
                          ) : (
                            <input
                              type="text"
                              required={input.required}
                              placeholder={input.placeholder}
                              value={value}
                              onChange={(e) => setCustomFields(prev => ({ ...prev, [input.label]: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                >
                  Continue to Payment Choice
                </button>
              </div>
            </form>
          )}
                    {/* STEP 2: Custom payment verification channel */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Choose Checkout Method
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  Choose between paying directly with standard UPI / bank transfer or getting redirected to complete your order over chat!
                </p>
              </div>

              {/* Master Stream Selector tabs */}
              {forceChatRedirect ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4.5 rounded-2xl flex items-start gap-3.5 dark:bg-amber-950/20">
                  <span className="text-xl">💬</span>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[12.5px] text-amber-800 dark:text-amber-400 block uppercase tracking-wide">Social Chat Redirect Required</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                      Your cart holds a <strong className="text-amber-700 dark:text-amber-300">special product</strong> configured for chat redirect checkout only. You will be redirected to WhatsApp, Instagram, or Messenger with your order details.
                    </p>
                  </div>
                </div>
              ) : forceDirectPay ? (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4.5 rounded-2xl flex items-start gap-3.5 dark:bg-indigo-950/20">
                  <span className="text-xl">💳</span>
                  <div className="space-y-1">
                    <span className="font-extrabold text-[12.5px] text-indigo-800 dark:text-indigo-400 block uppercase tracking-wide">Direct Payment Only</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                      This checkout is restricted to direct UPI or bank transfer only.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5 pb-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStream("instant")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between h-[96px] group ${
                      checkoutStream === "instant"
                        ? "bg-indigo-50/75 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800 ring-2 ring-indigo-500/10"
                        : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg text-xs font-bold leading-none ${checkoutStream === "instant" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>💳</span>
                      <span className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100">Direct Pay / UPI</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Submit digital receipts UTR for online ledger clearance.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStream("chat")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between h-[96px] group ${
                      checkoutStream === "chat"
                        ? "bg-indigo-50/75 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800 ring-2 ring-indigo-500/10"
                        : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg text-xs font-bold leading-none ${checkoutStream === "chat" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>💬</span>
                      <span className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100">Social Chat redirect</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-normal">
                      Redirect to chat (WhatsApp, Instagram, or Messenger).
                    </span>
                  </button>
                </div>
              )}

              {checkoutStream === "instant" ? (
                /* INSTANT DIRECT PAYMENT FLOW */
                <form onSubmit={handlePaymentSubmit} className="space-y-5 animate-fade-in">
                  {/* Sub-selector tabs */}
                  <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl grid grid-cols-4 gap-1">
                    {/* Active Admin Method */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod(paymentSettings.activeMethod)}
                      className={`py-2 rounded-xl text-[10.5px] font-bold tracking-tight uppercase cursor-pointer text-center transition ${
                        selectedMethod === paymentSettings.activeMethod
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      Prime Mode
                    </button>

                    {/* Direct UPI Manual */}
                    <button
                      type="button"
                      disabled={!paymentSettings.gpayUpid}
                      onClick={() => setSelectedMethod("upi")}
                      className={`py-2 rounded-xl text-[10.5px] font-bold tracking-tight uppercase cursor-pointer text-center transition ${
                        selectedMethod === "upi"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 disabled:opacity-40"
                      }`}
                    >
                      UPI ID
                    </button>

                    {/* Direct Bank Manual */}
                    <button
                      type="button"
                      disabled={!paymentSettings.bankAccount}
                      onClick={() => setSelectedMethod("bank")}
                      className={`py-2 rounded-xl text-[10.5px] font-bold tracking-tight uppercase cursor-pointer text-center transition ${
                        selectedMethod === "bank"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 disabled:opacity-40"
                      }`}
                    >
                      Bank details
                    </button>

                    {/* Backup GPay QR Code - Displaying UI precisely from the uploaded attachment */}
                    <button
                      type="button"
                      disabled={!paymentSettings.useBackupQr}
                      onClick={() => setSelectedMethod("backup")}
                      className={`py-2 rounded-xl text-[10.5px] font-bold tracking-tight uppercase cursor-pointer text-center transition ${
                        selectedMethod === "backup"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 disabled:opacity-40"
                      }`}
                    >
                      Backup QR Code
                    </button>
                  </div>

                  {/* Dynamic displays based on settings selection */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-4 animate-fade-in select-none">
                    
                    {/* 1. If method is actively Google Pay QR */}
                    {selectedMethod === "gpay_qr" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <Smartphone className="w-5 h-5" />
                          <span className="text-xs font-bold font-sans uppercase tracking-wider">Merchant GPay UPI QR</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                          <GPayCardUI 
                            upiId={paymentSettings.gpayUpid} 
                            merchantName={paymentSettings.gpayName} 
                            amount={total} 
                          />
                        </div>

                        {paymentSettings.gpayUpid === "dayalpal@okaxis" && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] leading-relaxed space-y-1">
                            <span className="font-extrabold block">⚠️ PLACEHOLDER UPI ID ACTIVE</span>
                            <p>
                              The current UPI payee address is set to <strong className="font-mono bg-white/20 px-1 py-0.5 rounded">dayalpal@okaxis</strong>, which is a placeholder. Indian UPI scanners will say <span className="underline italic">"No payment account registered"</span> for placeholders!
                            </p>
                            <p className="mt-1 font-semibold">
                              To fix this: Go to Admin Panel → Payment Settings, and update with your own active registered payee UPI VPA address.
                            </p>
                          </div>
                        )}

                        <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800 font-sans text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Merchant Name:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSettings.gpayName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Merchant UPI address:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-slate-800 dark:text-indigo-300 font-semibold">{paymentSettings.gpayUpid}</span>
                              <button
                                type="button"
                                onClick={() => triggerCopy(paymentSettings.gpayUpid, "upi")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 cursor-pointer"
                              >
                                {copiedValue === "upi" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Exact Total:</span>
                            <span className="font-extrabold text-indigo-600">₹{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Manual UPI */}
                    {selectedMethod === "upi" && (
                      <div className="space-y-3 font-sans text-xs">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <Smartphone className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-wider">Manual UPI Address Address</span>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Scan or copy the payee UPI identifier below in any wallet (GPay, PhonePe, Paytm, BHIM) to make a transfer of the exact order total.
                        </p>

                        <div className="bg-slate-100/50 dark:bg-slate-800/40 p-4 border border-slate-200/40 rounded-xl space-y-3">
                          <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">UPI VPA</p>
                              <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 mt-1">{paymentSettings.gpayUpid}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => triggerCopy(paymentSettings.gpayUpid, "vpa")}
                              className="p-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer"
                            >
                              {copiedValue === "vpa" ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                            </button>
                          </div>

                          <div className="flex justify-between items-center bg-white dark:bg-slate-800/70 p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
                            <span className="text-slate-500">Payee Account:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSettings.gpayName}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Direct Bank details */}
                    {selectedMethod === "bank" && (
                      <div className="space-y-3 font-sans text-xs">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Landmark className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-wider">Direct Bank Details Transfer</span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-normal">
                          Initiate an IMF / NEFT or wire transfer from your bank portal using the specifications detail below.
                        </p>

                        <div className="bg-slate-100/50 dark:bg-slate-800/40 p-3.5 border border-slate-200/40 rounded-xl space-y-2.5 font-sans">
                          <div className="flex justify-between pb-1 border-b border-slate-200/20">
                            <span className="text-slate-400 text-[11px]">Bank Institution:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{paymentSettings.bankName}</span>
                          </div>
                          <div className="flex justify-between pb-1 border-b border-slate-200/20 items-center">
                            <span className="text-slate-400 text-[11px]">Account ID:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentSettings.bankAccount}</span>
                              <button
                                type="button"
                                onClick={() => triggerCopy(paymentSettings.bankAccount, "bankacc")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 cursor-pointer"
                              >
                                {copiedValue === "bankacc" ? <Check className="w-3 h-3 text-green-500" /> : <Clipboard className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[11px]">IFSC Routing Identity:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentSettings.bankIfsc}</span>
                              <button
                                type="button"
                                onClick={() => triggerCopy(paymentSettings.bankIfsc, "ifsc")}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 cursor-pointer"
                              >
                                {copiedValue === "ifsc" ? <Check className="w-3 h-3 text-green-500" /> : <Clipboard className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Backup QR code - Displays GPay card configured by customer or dynamic fallback */}
                    {selectedMethod === "backup" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <Smartphone className="w-5 h-5 text-indigo-500" />
                          <span className="text-xs font-bold font-sans uppercase tracking-wider">Backup Google Pay QR Card</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <GPayCardUI 
                            upiId={paymentSettings.gpayUpid || "dp4737187@okicici"} 
                            merchantName={paymentSettings.gpayName || "Dayal Pal"} 
                            amount={total} 
                          />
                        </div>

                        {paymentSettings.gpayUpid === "dayalpal@okaxis" && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-[11px] leading-relaxed">
                            <span className="font-extrabold block">⚠️ PLACEHOLDER ACCOUNT INDICATION</span>
                            To scanner compatibility: Please configure your custom UPI address (e.g. yourname@okaxis) in the Admin Panel to route all checkout transactions directly to your preferred wallet!
                          </div>
                        )}

                        <p className="text-[11px] font-sans text-center text-slate-400 leading-normal italic">
                          This QR code represents your instant checkout system designed for seamless digital delivery. No standard transaction taxes apply.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Secure transaction check segment */}
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/85 pt-5">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-sans text-xs text-slate-500 space-y-1.5 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">💡 How to find your UTR ID?</span>
                      <p>
                        Once payment is sent, open your app's transaction history details. Find the <strong className="text-slate-700 dark:text-slate-350">12-Digit UPI Ref ID / UTR Number</strong> (typically starting with 3 or 4) and enter it below to confirm your order.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-350 flex items-center gap-1.5 uppercase tracking-wide">
                          <Lock className="w-3.5 h-3.5 text-indigo-600" />
                          12-Digit Payment UTR ID
                        </label>
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                          Required
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Enter 12-digit UTR ID (e.g. 301294857201)"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full border rounded-xl px-4 py-2.5 text-xs font-extrabold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-300 border-slate-200 dark:border-slate-700"
                        />
                      </div>

                      {selectedMethod === "bank" && (
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Your Bank Name"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-sans"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-500 select-none">
                      <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Your secure transaction tracking will register automatically to the admin dashboard for verification.
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer font-sans"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !transactionId.trim()}
                      className={`px-6 py-3 select-none cursor-pointer transition duration-150 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 font-sans shadow ${
                        transactionId.trim()
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]" 
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{verificationStage || "Placing Secure Order..."}</span>
                        </>
                      ) : (
                        "Place Order & Get Order ID"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* CHAT REDIRECTION FLOW */
                <form onSubmit={handleChatCheckoutSubmit} className="space-y-5 animate-fade-in text-xs font-sans">
                  <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-150 dark:border-slate-800 rounded-2xl p-4.5 space-y-4">
                    <span className="font-extrabold tracking-wide uppercase text-slate-400 block text-[10.5px]">Select preferred messaging platform:</span>
                    
                    <div className="flex flex-col gap-3">
                      {/* WhatsApp Option */}
                      {paymentSettings.enableWhatsApp !== false && paymentSettings.whatsAppLink && (
                        <button
                          type="button"
                          onClick={() => setSelectedChatChannel("whatsapp")}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between group ${
                            selectedChatChannel === "whatsapp"
                              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/10"
                              : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500 text-white text-lg font-bold">🟢</span>
                            <div>
                              <p className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100">WhatsApp Redirection</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Send optimized checkout confirmation over WhatsApp</p>
                            </div>
                          </div>
                          <input 
                            type="radio" 
                            checked={selectedChatChannel === "whatsapp"} 
                            onChange={() => setSelectedChatChannel("whatsapp")}
                            className="w-4.5 h-4.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                          />
                        </button>
                      )}

                      {/* Instagram Option */}
                      {paymentSettings.instagramLink && (
                        <button
                          type="button"
                          onClick={() => setSelectedChatChannel("instagram")}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between group ${
                            selectedChatChannel === "instagram"
                              ? "bg-purple-50/60 dark:bg-purple-950/20 border-purple-300 dark:border-purple-850 ring-2 ring-purple-500/10"
                              : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white text-sm font-bold">📸</span>
                            <div>
                              <p className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100">Instagram DM Chat</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Contact the merchant directly over Instagram Inbox</p>
                            </div>
                          </div>
                          <input 
                            type="radio" 
                            checked={selectedChatChannel === "instagram"} 
                            onChange={() => setSelectedChatChannel("instagram")}
                            className="w-4.5 h-4.5 text-purple-600 focus:ring-purple-500 cursor-pointer" 
                          />
                        </button>
                      )}

                      {/* Facebook Messenger */}
                      {paymentSettings.messengerLink && (
                        <button
                          type="button"
                          onClick={() => setSelectedChatChannel("messenger")}
                          className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between group ${
                            selectedChatChannel === "messenger"
                              ? "bg-blue-50/65 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/10"
                              : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-blue-600 text-white text-lg font-bold">⚡</span>
                            <div>
                              <p className="font-extrabold text-[12.5px] text-slate-800 dark:text-slate-100">Facebook Messenger</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Submit checkout details via Messenger inbox chat</p>
                            </div>
                          </div>
                          <input 
                            type="radio" 
                            checked={selectedChatChannel === "messenger"} 
                            onChange={() => setSelectedChatChannel("messenger")}
                            className="w-4.5 h-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-150/40 text-[11px] leading-relaxed text-indigo-800 dark:text-indigo-300">
                      <strong>How it works:</strong> We will reserve your items in our database and generate a secure Order ID. We will then automatically prepare a receipt and redirect you to chat with us to complete the layout!
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer font-sans"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 select-none cursor-pointer transition duration-150 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 font-sans shadow bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Preparing Redirect...</span>
                        </>
                      ) : (
                        "Order & Redirect to Chat 🚀"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: Complete Success screen */}
          {step === 3 && (
            <div className="py-8 text-center space-y-6 animate-fade-in font-sans">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Order Registered!
                </h3>
                {checkoutStream === "chat" ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                    Your preorder is registered! Since you opted for chat checkout, click below to open your messaging app and send us the receipt copy.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                    We've recorded your purchase details and sent confirmation details for ledger clearance.
                  </p>
                )}
              </div>

              {/* Order ID prominent display card */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-sm mx-auto shadow-sm text-center">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black font-sans">Your Unique Order Code</p>
                <p className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-wider mt-2 select-all break-all">{placedOrderReference}</p>
                <p className="text-[10px] text-slate-400 font-semibold font-sans mt-2.5">
                  Save this Order ID to reference with the administrator.
                </p>
              </div>

              {/* If redirected via chat, provide active platform launcher buttons */}
              {checkoutStream === "chat" && placedOrderReference && (
                <div className="p-4.5 bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-150 rounded-2xl max-w-sm mx-auto space-y-3">
                  <span className="text-[11px] block font-extrabold text-indigo-800 dark:text-indigo-300">⚡ Direct Messaging Action Required</span>
                  
                  {selectedChatChannel === "whatsapp" && paymentSettings.whatsAppLink && (
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow hover:scale-[1.01]"
                    >
                      Open WhatsApp Chat Thread 💬
                    </a>
                  )}

                  {selectedChatChannel === "instagram" && paymentSettings.instagramLink && (
                    <a
                      href={getInstagramUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow hover:scale-[1.01]"
                    >
                      Open Instagram DM Chat 📱
                    </a>
                  )}

                  {selectedChatChannel === "messenger" && paymentSettings.messengerLink && (
                    <a
                      href={getMessengerUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow hover:scale-[1.01]"
                    >
                      Open Messenger Chat ⚡
                    </a>
                  )}
                </div>
              )}

              <div className="pt-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98] transition rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer font-sans shadow shadow-indigo-650/10"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
