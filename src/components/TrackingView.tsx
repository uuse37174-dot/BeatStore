import React, { useState } from "react";
import { Search, MapPin, Receipt, Clock, ShoppingBag, CheckCircle, ShieldAlert, AlertCircle, Hourglass, ArrowRight, CornerDownRight, Check, RefreshCw } from "lucide-react";

interface TrackedOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  paymentMethodUsed: string;
  paymentDetails: {
    transactionId: string;
    timestamp: string;
    bankName?: string;
  };
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Verified';
  date: string;
  customFields?: Record<string, string>;
}

interface TrackingViewProps {
  onNavigateToShop: () => void;
  onTrackQuery?: (queryStr: string) => Promise<any[]>;
}

export default function TrackingView({ onNavigateToShop, onTrackQuery }: TrackingViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setHasSearched(true);

    try {
      let data;
      if (onTrackQuery) {
        data = await onTrackQuery(searchQuery.trim());
      } else {
        const res = await fetch(`/api/orders/track?query=${encodeURIComponent(searchQuery.trim())}`);
        if (!res.ok) {
          throw new Error("Query lookup failed. Verify your server configuration.");
        }
        data = await res.json();
      }
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An error occurred while communicating with the telemetry tracking node.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColorAndLabels = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          title: "Pending Approval",
          desc: "The administrator is currently evaluating your payment reference sequence. This standard check is offline and is manually verified within minutes.",
          stepIndex: 1
        };
      case "In Progress":
        return {
          bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse",
          icon: <Hourglass className="w-5 h-5 text-indigo-500 animate-spin" />,
          title: "In Progress / Preparing Delivery",
          desc: "Your transaction has been approved! The publisher is assembling digital components, files, and dispatching download parameters to your registered inbox.",
          stepIndex: 2
        };
      case "Verified":
      case "Completed":
        return {
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          title: "Order Completed",
          desc: "Delivery successfully dispatched. All digital sound packages, articles, and licenses have been fully released to your provided email address. Enjoy!",
          stepIndex: 3
        };
      case "Cancelled":
        return {
          bg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
          title: "Void / Cancelled",
          desc: "This checkout record was cancelled or flagged as void. This happens when duplicate or incorrect payment reference tokens are provided during submission.",
          stepIndex: 0
        };
      default:
        return {
          bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
          icon: <AlertCircle className="w-5 h-5 text-slate-500" />,
          title: "Awaiting Log",
          desc: "Order has entered queue pipeline routing.",
          stepIndex: 1
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* 1. Page Identity Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold uppercase text-[10px] tracking-widest rounded-full border border-indigo-100 dark:border-indigo-900/40">
          Order Tracking Channel
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Payment & Delivery Status
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          Enter your Order Reference Number (e.g., <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ORD-1234</span>) or your registered customer Email to query live order states and access instant file dispatch stats.
        </p>
      </div>

      {/* 2. Track Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 p-6 rounded-3xl shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="space-y-1.5 font-sans">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Reference Query parameters
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter ORD-XXXX or customer email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <Search className="absolute left-4 top-4 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-sans transition shadow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching Ledger database...</span>
              </>
            ) : (
              <>
                <span>Search Verification Records</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* 3. Search results & logs rendering */}
      {hasSearched && !loading && (
        <div className="space-y-8 animate-fade-in pt-4">
          {errorMsg ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-center gap-2 max-w-xl mx-auto text-xs text-red-800 dark:text-red-400 font-sans">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-indigo-950/10 border border-slate-100 dark:border-slate-900 rounded-3xl max-w-xl mx-auto space-y-3 font-sans">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Transaction Records Found</h4>
                <p className="text-xs text-slate-500">
                  We scanned our entire database but couldn't locate any matching credentials for <strong className="font-mono text-indigo-600 dark:text-indigo-400">"{searchQuery}"</strong>.
                </p>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 max-w-sm mx-auto leading-relaxed">
                Tip: Order IDs look like "ORD-1234" (with the dash). Double check that you've typed your receipt details perfectly!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-center text-xs font-black uppercase tracking-widest text-indigo-500 font-sans">
                Matches Found ({orders.length} transaction reference logs detected)
              </h3>

              {orders.map((ord) => {
                const statusDetails = getStatusColorAndLabels(ord.status);
                const isFinalized = ord.status === "Completed" || ord.status === "Verified";

                return (
                  <div key={ord.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80 animate-fade-in-up">
                    
                    {/* Left: Progression Status */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Invoice reference</span>
                          <span className="px-2 py-0.5 bg-slate-105 dark:bg-slate-800 rounded text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/35">{ord.id}</span>
                        </div>

                        <div className={`p-3.5 border rounded-2xl ${statusDetails.bg} flex items-start gap-3`}>
                          <div className="shrink-0 mt-0.5">{statusDetails.icon}</div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wide leading-tight">{statusDetails.title}</h4>
                            <p className="text-[10.5px] leading-relaxed mt-1 font-sans">{statusDetails.desc}</p>
                          </div>
                        </div>
                      </div>

                      {/* Visual Pipeline Stepper */}
                      <div className="space-y-4">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Dispatch Status Timeline</p>
                        <div className="space-y-3 font-sans">
                          {/* Step 1: Placed */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-805 dark:text-slate-200 leading-none">Order Submitted</p>
                              <p className="text-[10px] text-slate-405 dark:text-slate-550 mt-0.5">Payment synced instantly via proof ID.</p>
                            </div>
                          </div>

                          {/* Step 2: Preparing */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                              statusDetails.stepIndex >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {statusDetails.stepIndex >= 3 ? <Check className="w-3 h-3" /> : "2"}
                            </div>
                            <div>
                              <p className={`font-bold leading-none ${statusDetails.stepIndex >= 2 ? "text-slate-805 dark:text-slate-200 animate-pulse" : "text-slate-400"}`}>
                                Admin Processing
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Publisher is evaluating delivery parameters.</p>
                            </div>
                          </div>

                          {/* Step 3: Complete */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                              statusDetails.stepIndex >= 3 ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {statusDetails.stepIndex >= 3 ? <Check className="w-3 h-3" /> : "3"}
                            </div>
                            <div>
                              <p className={`font-bold leading-none ${statusDetails.stepIndex >= 3 ? "text-slate-805 dark:text-slate-200" : "text-slate-400"}`}>
                                Delivered
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">File parameters, licenses, & receipts sent.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buy Action */}
                      <button
                        onClick={onNavigateToShop}
                        className="w-full bg-slate-50 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-150 dark:border-slate-750 font-bold py-2.5 px-4 rounded-xl text-[11px] uppercase tracking-wider cursor-pointer font-sans transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-indigo-500" />
                        Buy Something Else
                      </button>
                    </div>

                    {/* Right: Invoice Summary Details */}
                    <div className="md:col-span-3 p-6 space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-500 leading-none">Purchase Invoice Specs</span>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(ord.date).toLocaleDateString()}</span>
                        </div>

                        {/* Customer credentials */}
                        <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold leading-none font-sans">For Recipient</p>
                            <p className="font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{ord.customerName}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{ord.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold leading-none font-sans">Payment Method</p>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100 mt-1">{ord.paymentMethodUsed.split(" (")[0]}</p>
                            <p className="text-[10px] font-mono text-indigo-650 dark:text-indigo-400 truncate mt-0.5 select-all">{ord.paymentDetails?.transactionId}</p>
                          </div>
                        </div>

                        {/* Custom fields gathered */}
                        {ord.customFields && Object.keys(ord.customFields).length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl space-y-1.5 border border-slate-100 dark:border-slate-800/85">
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 leading-none">Declared Delivery Custom Fields</p>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              {Object.entries(ord.customFields).map(([label, value]) => {
                                const isImage = typeof value === "string" && value.startsWith("data:image/");
                                return (
                                  <div key={label} className="text-xs font-sans text-slate-650 dark:text-slate-450 border-b border-slate-100 dark:border-slate-900 pb-1.5 last:border-0 last:pb-0">
                                    <div className="flex font-semibold items-center justify-between text-[11px]">
                                      <span className="text-slate-430 text-[10px]">{label}:</span>
                                      {isImage ? (
                                        <div className="w-8 h-8 rounded border border-slate-205 overflow-hidden scale-100 hover:scale-[3] transition origin-right shadow-md">
                                          <img src={value} alt="Attachment" className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <span className="font-extrabold text-slate-805 dark:text-slate-200 max-w-[150px] truncate select-all">{value}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Product Items Table */}
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-405 leading-none">Items Included ({ord.items?.length})</p>
                          <div className="space-y-1.5 font-sans">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="bg-slate-50/50 dark:bg-slate-850 border border-slate-150/40 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">₹{item.price?.toFixed(2)} each</p>
                                </div>
                                <div className="text-right text-xs">
                                  <p className="font-extrabold text-slate-805 dark:text-slate-150">₹{(item.price * item.quantity).toFixed(2)}</p>
                                  <p className="text-[10px] font-bold font-mono text-indigo-650 dark:text-indigo-400">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Total cost and bottom footer info */}
                      <div className="bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-10/20 p-3 rounded-2xl flex items-center justify-between mt-2.5">
                        <div className="text-left font-sans">
                          <p className="text-[9px] uppercase tracking-wider text-indigo-500 font-semibold leading-none">Order Invoice Total</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Tax, transfer and syncing fees included.</p>
                        </div>
                        <span className="text-lg font-black text-indigo-655 dark:text-indigo-400 font-sans">₹{ord.total?.toFixed(2)}</span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Common FAQ section */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 prose font-sans text-xs max-w-xl mx-auto space-y-4">
        <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-450 uppercase tracking-widest leading-none mb-2 select-none font-sans flex items-center gap-1">
          <Clock className="w-4 h-4 animate-pulse" />
          Fulfillment Help desk & FAQ
        </h4>
        <div className="space-y-3 font-sans leading-relaxed text-slate-650 dark:text-slate-355 text-[11px]">
          <div>
            <strong className="block text-slate-800 dark:text-slate-200 font-bold mb-0.5">How long does custom order approval take?</strong>
            Because checkout uses secure auto-sync technology, payment reference confirmations are cataloged live! The publisher will review and dispatch orders within minutes, updating your status sequence here instantly.
          </div>
          <div>
            <strong className="block text-slate-800 dark:text-slate-200 font-bold mb-0.5">Why does my order say "Pending"?</strong>
            "Pending" means your Transaction sequence has been successfully registered and is waiting in the publisher's manual routing queue for dispatch checks. It will transition to "In Progress" or "Completed" in short order!
          </div>
          <div>
            <strong className="block text-slate-800 dark:text-slate-200 font-bold mb-0.5">I can't find my files, what do I do?</strong>
            Verify that your email address was typed perfectly during Step 1. In case of issues, you can submit queries along with your order ID (`ORD-XXXX`) directly.
          </div>
        </div>
      </div>

    </div>
  );
}
