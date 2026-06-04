import React, { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  AuthError
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteTexts } from "../types";

interface AuthScreenProps {
  siteTexts: SiteTexts;
  onClose?: () => void;
  customPrompt?: string;
  isModal?: boolean;
  onAuthSuccess?: (user: any) => void;
}

export default function AuthScreen({ siteTexts, onClose, customPrompt, isModal = false, onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    clearForm();
  };

  const decodeError = (err: AuthError) => {
    console.error("Auth transaction failed:", err);
    const code = err.code || "";
    const msg = err.message || "";
    
    // Catch domain restriction errors specifically and offer clear steps for the developer
    if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain") || msg.includes("unauthorized domain")) {
      return `This domain (${window.location.hostname}) is not authorized in your Firebase console. Go to your Firebase Console > Authentication > Settings > Authorized Domains, and add "${window.location.hostname}" to the list!`;
    }

    if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
      return "Email/Password sign-in provider is disabled. Please enable 'Email/Password' in your Firebase Console > Authentication > Sign-in method section.";
    }

    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address format. Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled by an administrator.";
      case "auth/user-not-found":
        return "No account matches this email address. Please register a new account first.";
      case "auth/wrong-password":
        return "Incorrect password. Please verify your details and try again.";
      case "auth/email-already-in-use":
        return "This email is already registered to another user.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/popup-closed-by-user":
        return "Login pop-up was closed before completion.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email but a different login method.";
      default:
        return msg || "Authentication failed. Please verify and try again.";
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, {
          displayName: name.trim()
        });
        setSuccessMsg("Account successfully created! Loading your session...");
        
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(userCredential.user);
          }, 800);
        } else if (onClose) {
          setTimeout(onClose, 1000);
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg("Logged in successfully! Welcome back.");
        
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(userCredential.user);
          }, 800);
        } else if (onClose) {
          setTimeout(onClose, 1000);
        }
      }
    } catch (err: any) {
      setError(decodeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      setSuccessMsg("Successfully signed in with Google!");
      
      if (onAuthSuccess) {
        setTimeout(() => {
          onAuthSuccess(userCredential.user);
        }, 800);
      } else if (onClose) {
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setError(decodeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const facebookProvider = new FacebookAuthProvider();
      facebookProvider.addScope("email");
      const userCredential = await signInWithPopup(auth, facebookProvider);
      setSuccessMsg("Successfully signed in with Facebook!");
      
      if (onAuthSuccess) {
        setTimeout(() => {
          onAuthSuccess(userCredential.user);
        }, 800);
      } else if (onClose) {
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setError(decodeError(err));
    } finally {
      setLoading(false);
    }
  };

  const cardMarkup = (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative transition-all duration-300">
      
      {/* Absolute Close Option if onClose provided */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Styled Branding header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-650/20">
          {siteTexts.brandName ? siteTexts.brandName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "DP"}
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {siteTexts.brandName}
          </h1>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium uppercase tracking-widest mt-0.5">
            {siteTexts.subLabel || "Secure Authorization Portal"}
          </p>
        </div>
      </div>

      {/* Segment Switcher (Beautiful Tab Control) */}
      <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl grid grid-cols-2 gap-1 border border-slate-200/40 dark:border-slate-800/40">
        <button
          type="button"
          onClick={() => handleToggleMode(false)}
          className={`py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            !isSignUp 
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleToggleMode(true)}
          className={`py-2.5 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            isSignUp 
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Register Account
        </button>
      </div>

      {/* Dynamic subtitle description helper */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {customPrompt ? customPrompt : (isSignUp ? "Get instant access to publishing journals, aesthetic boards & premium checkout." : "Unlock the premium aesthetics journal and checkout vault.")}
        </p>
      </div>

      {/* Social Login Stack */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 py-3 px-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-[0.98] hover:shadow-sm"
          >
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.65 1.58 15.01 1 12 1 7.24 1 3.2 3.73 1.25 7.7l3.96 3.07C6.16 7.42 8.87 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-2 3.74-4.94 3.74-8.55z" />
              <path fill="#FBBC05" d="M5.21 10.77c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.25 7.12C.45 8.72 0 10.51 0 12.38s.45 3.66 1.25 5.26l3.96-3.87z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-4.27 1.09-3.13 0-5.84-2.38-6.79-5.73L1.25 15.65C3.2 19.63 7.24 23 12 23z" />
            </svg>
            <span className="font-sans">Google</span>
          </button>

          {/* Facebook SSO */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 py-3 px-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-[0.98] hover:shadow-sm"
          >
            <svg className="w-4.5 h-4.5 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="font-sans">Facebook</span>
          </button>
        </div>
      </div>

      {/* Styled separator */}
      <div className="relative flex items-center justify-center py-1">
        <span className="absolute bg-white dark:bg-slate-900 px-4 text-[9px] font-extrabold uppercase tracking-widest text-slate-450 dark:text-slate-500">
          Or continue with email
        </span>
        <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
      </div>

      {/* Inputs block */}
      <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
        {/* Full Name field (smooth render) */}
        {isSignUp && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
              Full Name
            </label>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-0.5">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-slate-900 dark:text-white rounded-2xl focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
            Email Address
          </label>
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-0.5">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="verified@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-slate-900 dark:text-white rounded-2xl focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
            Password
          </label>
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-0.5">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent pl-11 pr-11 py-3 text-xs font-semibold text-slate-900 dark:text-white rounded-2xl focus:outline-none placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Confirmation */}
        {isSignUp && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block">
              Confirm Password
            </label>
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all p-0.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-slate-900 dark:text-white rounded-2xl focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-2xl flex items-start gap-2.5 text-red-700 dark:text-red-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold flex-1">{successMsg}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-md hover:shadow-lg hover:bg-slate-850 dark:hover:bg-slate-50 cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5">
              {isSignUp ? "Create Secure Account" : "Sign In to Vault"}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </div>
  );

  if (isModal) {
    return cardMarkup;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-650/15 selection:text-indigo-500">
      {/* Decorative background grids & elements */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-400/5 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      {cardMarkup}
    </div>
  );
}
