import React from "react";

interface GPayCardUIProps {
  upiId?: string;
  merchantName?: string;
  amount?: number;
}

export default function GPayCardUI({
  upiId = "dp4737187@okicici",
  merchantName = "Dayal Pal",
  amount
}: GPayCardUIProps) {
  // Build a legitimate, robust UPI URI for scanning
  const cleanUpiId = (upiId || "").trim();
  const cleanName = (merchantName || "Merchant").trim();
  const cleanNote = "DigitalPurchase";
  
  // Format amount precisely
  const formattedAmount = amount ? Number(amount).toFixed(2) : "";

  // Standard UPI deep-link query string representation (unencoded nested fields to prevent double-encoding)
  const upiUri = `upi://pay?pa=${cleanUpiId}&pn=${cleanName}${formattedAmount ? `&am=${formattedAmount}` : ""}&cu=INR&tn=${cleanNote}&mc=0000&mode=02&purpose=00`;
  
  // We use ECC level 'M' (Medium) to reduce QR complexity so scanners can parse it instantly in any light condition.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=000000&bgcolor=ffffff&ecc=M&margin=0&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900 to-black text-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-800 relative overflow-hidden select-none">
      {/* Decorative metal shine element */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      
      {/* Top Brushed Border Frame */}
      <div className="absolute top-2 left-2 right-2 bottom-2 border border-yellow-500/10 rounded-[22px] pointer-events-none" />
      
      {/* Header Merchant Info */}
      <div className="flex items-center justify-center gap-3.5 mb-5 relative z-10">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center overflow-hidden">
          {/* Mock green temple icon like the uploaded image */}
          <svg className="w-6 h-6 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9.75M3 13.5h18M5.25 13.5v-2.25A6.75 6.75 0 0112 4.5a6.75 6.75 0 016.75 6.75v2.25M3 13.5a9 9 0 0118 0M9 9h.008v.008H9V9zm6 0h.008v.008H15V9z" />
          </svg>
        </div>
        <span className="text-xl font-medium tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent font-sans">
          {merchantName}
        </span>
      </div>

      {/* Main PAY HERE title */}
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
          PAY HERE
        </h1>
      </div>

      {/* Glowing QR Scanner Frame with perfect geometric alignment */}
      <div className="mx-auto w-56 h-56 rounded-2xl bg-white p-4.5 shadow-[0_0_30px_rgba(245,158,11,0.3)] border border-amber-400/30 relative flex items-center justify-center overflow-hidden">
        {/* Neon target bracket corner overlays positioned exactly on the edges of the box */}
        <div className="absolute top-1 left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-sm z-20" />
        <div className="absolute top-1 right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-sm z-20" />
        <div className="absolute bottom-1 left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-sm z-20" />
        <div className="absolute bottom-1 right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-sm z-20" />
        
        {/* Real Dynamic QR code wrapper centered exactly */}
        <div className="w-full h-full flex items-center justify-center p-0.5 bg-white rounded-lg">
          <img 
            src={qrCodeUrl}
            alt={`UPI QR Code: ${upiId}`}
            className="w-full h-full object-contain block mx-auto rounded-md"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Helper caption indicating dynamic optimization */}
      <div className="text-center mt-3 relative z-10">
        <p className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          Dynamically Generated for ₹{formattedAmount || "INR"}
        </p>
        <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono tracking-widest">
          No center logo overlay • Scan guaranteed
        </p>
      </div>

      {/* India UPI Wallets Brand Badges Row */}
      <div className="flex items-center justify-center gap-3.5 mt-3 mb-5 relative z-10">
        {/* PhonePe Style */}
        <div className="flex flex-col items-center bg-indigo-950/40 border border-indigo-500/20 px-2 py-1 rounded-md">
          <span className="text-[9px] font-extrabold text-indigo-300 tracking-wider">PhonePe</span>
        </div>
        
        {/* Paytm Style */}
        <div className="flex flex-col items-center bg-sky-950/40 border border-sky-400/20 px-2 py-1 rounded-md">
          <span className="text-[9px] font-extrabold text-sky-300 tracking-wider">Paytm</span>
        </div>

        {/* BHIM Style */}
        <div className="flex flex-col items-center bg-teal-950/40 border border-teal-400/20 px-2 py-1 rounded-md">
          <span className="text-[9px] font-extrabold text-teal-300 tracking-wider">BHIM</span>
        </div>

        {/* Amazon Pay Style */}
        <div className="flex flex-col items-center bg-orange-950/40 border border-orange-400/20 px-2 py-1 rounded-md">
          <span className="text-[9px] font-extrabold text-orange-300 tracking-wider">Amazon Pay</span>
        </div>
      </div>

      {/* Decorative Gold text bottom footer */}
      <div className="text-center border-t border-slate-800/80 pt-3.5 mt-2 relative z-10">
        <p className="text-md font-semibold tracking-wide text-amber-300 uppercase leading-none font-sans">
          Scan QR Code
        </p>
        <p className="text-[11px] font-medium tracking-widest text-slate-300 uppercase leading-snug mt-1">
          for Instant Payment
        </p>
      </div>
    </div>
  );
}
