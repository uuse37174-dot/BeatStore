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
import { Mail, Lock, User, Sparkles, AlertCircle, HelpCircle, Eye, EyeOff, X } from "lucide-react";
import { SiteTexts } from "../types";

interface AuthScreenProps {
  siteTexts: SiteTexts;
  onClose?: () => void;
  customPrompt?: string;
  isModal?: boolean;
}

export default function AuthScreen({ siteTexts, onClose, customPrompt, isModal = false }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    clearForm();
  };

  const decodeError = (err: AuthError) => {
    console.error("Auth failed with details:", err);
    switch (err.code) {
      case "auth/invalid-email":
        return "The provided email address format is invalid.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No account exists with this email address. Please register above.";
      case "auth/wrong-password":
        return "Incorrect password. Please verify and try again.";
      case "auth/email-already-in-use":
        return "An account with this email address is already registered.";
      case "auth/weak-password":
        return "The password is too weak. Please use at least 6 characters.";
      case "auth/operation-not-allowed":
        return "This authentication provider (e.g. Email/Password or Facebook) is not yet enabled in the Firebase Console. See the config guide below.";
      case "auth/popup-closed-by-user":
        return "The login window was closed before completing authentication.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address but different sign-in credentials.";
      default:
        return err.message || "Failed to authenticate. Please try again.";
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
        setSuccessMsg("Account registered successfully! Welcome!");
        if (onClose) {
          setTimeout(onClose, 800);
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg("Logged in successfully! Welcome back!");
        if (onClose) {
          setTimeout(onClose, 800);
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
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg("Google login successful!");
      if (onClose) {
        setTimeout(onClose, 800);
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
      await signInWithPopup(auth, facebookProvider);
      setSuccessMsg("Facebook login successful!");
      if (onClose) {
        setTimeout(onClose, 800);
      }
    } catch (err: any) {
      setError(decodeError(err));
    } finally {
      setLoading(false);
    }
  };

  const cardMarkup = (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10 transition">
      
      {/* Absolute Close Option if onClose provided */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Display Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg shadow-indigo-600/15">
          {siteTexts.brandName ? siteTexts.brandName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "DP"}
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{siteTexts.brandName}</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-widest">{siteTexts.subLabel}</p>
        </div>
        <div className="h-0.5 w-12 bg-indigo-600/20 rounded mx-auto mt-2" />
      </div>

      {/* Dynamic Sign In / Register Prompt */}
      <div className="text-center">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
          {customPrompt ? customPrompt : (isSignUp ? "Create your account" : "Sign in to access")}
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-1">
          {isSignUp ? "Get instant access to publishing journals & creator tools." : "Unlock the aesthetics journal, tools, and checkout vault."}
        </p>
      </div>

      {/* Global Errors and success reporting */}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-red-705 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-medium font-sans flex-1">
            {error}
            {error.includes("operation-not-allowed") && (
              <button 
                type="button" 
                onClick={() => setShowGuide(true)} 
                className="block mt-1.5 font-bold underline hover:text-red-800 dark:hover:text-red-300 transition text-[11px]"
              >
                View Setup Instructions &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs text-left">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold font-sans flex-1">{successMsg}</span>
        </div>
      )}

      {/* Email & Password Input Submission Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
        
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800 focus:border-indigo-500 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-850 focus:border-indigo-500 focus:outline-none transition font-sans"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-950 pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-850 focus:border-indigo-500 focus:outline-none transition font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-850 focus:border-indigo-500 focus:outline-none transition font-sans"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow shadow-indigo-600/10 cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isSignUp ? (
            "Complete Registration"
          ) : (
            "Sign In with Email"
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="relative flex items-center justify-center">
        <span className="absolute bg-white dark:bg-slate-900 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Or continue with</span>
        <div className="w-full border-t border-slate-150 dark:border-slate-800/80"></div>
      </div>

      {/* Google and Facebook Authentication Row */}
      <div className="grid grid-cols-2 gap-3 pb-1">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-705 dark:text-slate-200 border border-slate-200/60 dark:border-slate-850 py-3 px-3 rounded-xl text-xs font-black font-sans cursor-pointer transition"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.65 1.58 15.01 1 12 1 7.24 1 3.2 3.73 1.25 7.7l3.96 3.07C6.16 7.42 8.87 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-2 3.74-4.94 3.74-8.55z" />
            <path fill="#FBBC05" d="M5.21 10.77c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.25 7.12C.45 8.72 0 10.51 0 12.38s.45 3.66 1.25 5.26l3.96-3.87z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-4.27 1.09-3.13 0-5.84-2.38-6.79-5.73L1.25 15.65C3.2 19.63 7.24 23 12 23z" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-705 dark:text-slate-200 border border-slate-200/60 dark:border-slate-850 py-3 px-3 rounded-xl text-xs font-black font-sans cursor-pointer transition"
        >
          <svg className="w-4 h-4 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Alternate Selection Mode Footer */}
      <div className="text-center pt-1">
        <p className="text-xs text-slate-500">
          {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition ml-1"
          >
            {isSignUp ? "Sign In Instead" : "Register / Create Account"}
          </button>
        </p>
      </div>

      {/* Settings Help Toggle */}
      <div className="text-center border-t border-slate-100 dark:border-slate-850/60 pt-4">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-450 hover:text-slate-600 dark:hover:text-slate-300 transition font-sans bg-transparent border-0 cursor-pointer"
        >
          <span>Developer setup guide for login providers</span>
        </button>
      </div>

      {/* Collapsible Guidance Information */}
      {showGuide && (
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 space-y-3 font-sans animate-fade-in text-left">
          <h4 className="font-extrabold text-slate-800 dark:text-slate-200">How to Setup Auth Providers in your Firebase Console:</h4>
          <ol className="list-decimal pl-4 space-y-2 text-[11px]">
            <li>
              Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-bold">Firebase Console</a>.
            </li>
            <li>
              Click on <strong>Authentication</strong> &gt; <strong>Sign-in method</strong> tab.
            </li>
            <li>
              <strong>Email/Password configuration</strong>: Click <em>Add new provider</em>, click <em>Email/Password</em>, toggle to <strong>Enabled</strong>, and hit <em>Save</em>.
            </li>
            <li>
              <strong>Google configuration</strong>: Make sure Google provider is <strong>Enabled</strong>.
            </li>
            <li>
              <strong>Facebook configuration</strong>: Click <em>Add new provider</em>, choose <em>Facebook</em>, enter your Facebook App ID and App Secret (from Meta Developers dashboard), and save.
            </li>
          </ol>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return cardMarkup;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-600/10 selection:text-indigo-505">
      {/* Decorative background grids & elements */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-400/5 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      {cardMarkup}
    </div>
  );
}
