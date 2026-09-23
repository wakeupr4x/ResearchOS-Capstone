"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth, AcademicRole, PRESET_ACCOUNTS } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    isAuthenticated,
    loginWithCredentials,
    register,
    loginWithOAuth,
    switchAccount,
    logout,
    generateNewApiKey,
  } = useAuth();

  const [tab, setTab] = useState<"signin" | "register" | "personas" | "settings">(
    isAuthenticated ? "settings" : "signin"
  );

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AcademicRole>("PhD Candidate");
  const [institution, setInstitution] = useState("Stanford University / AI Lab");
  const [labName, setLabName] = useState("Neural Systems & Grounding Lab");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        setSuccessMessage("Authenticated successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await register({ name, email, password, role, institution, labName });
      if (res.success) {
        setSuccessMessage("Academic account created successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      await loginWithOAuth(provider);
      setSuccessMessage(`Authenticated via ${provider === "google" ? "Google Scholar" : "GitHub Academic"}!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white font-sans">
                ResearchOS Academic Identity
              </h3>
              <p className="text-xs text-indigo-200">
                Institutional Authentication & Lab Clearance
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 mt-5 bg-white/10 p-1 rounded-xl text-xs font-semibold">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setTab("settings")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    tab === "settings" ? "bg-white text-slate-900 shadow-sm" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  My Profile & Keys
                </button>
                <button
                  onClick={() => setTab("personas")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    tab === "personas" ? "bg-white text-slate-900 shadow-sm" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Switch Lab Role
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTab("signin")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    tab === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setTab("personas")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    tab === "personas" ? "bg-white text-slate-900 shadow-sm" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  Demo Roles
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[520px] space-y-4">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Institutional / Academic Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. researcher@stanford.edu or student@mit.edu"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your lab password (min 6 characters)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Lab Workspace"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">
                  Or One-Click Scholar Auth
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                >
                  <span>🎓</span>
                  <span>Google Scholar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth("github")}
                  className="flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                >
                  <span>🐙</span>
                  <span>GitHub Scholar</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Academic Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AcademicRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                >
                  <option value="Principal Investigator">Principal Investigator (PI / Lab Director)</option>
                  <option value="Senior Researcher">Senior Researcher / Staff Scientist</option>
                  <option value="Postdoctoral Fellow">Postdoctoral Fellow</option>
                  <option value="PhD Candidate">PhD Candidate</option>
                  <option value="Master's Student">Master's Student</option>
                  <option value="Undergraduate Researcher">Undergraduate Researcher</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Institution / University</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Lab Affiliation</label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="e.g. CSAIL AI Group"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? "Creating Identity..." : "Create Academic Clearance Profile"}
              </button>
            </form>
          )}

          {/* TAB 3: DEMO PERSONAS / SWITCH ROLE */}
          {tab === "personas" && (
            <div className="space-y-3">
              <span className="text-[11px] text-slate-500 font-medium block">
                Select a verified institutional persona to explore different clearance levels:
              </span>

              {PRESET_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    switchAccount(acc);
                    setSuccessMessage(`Switched active account to ${acc.name}!`);
                    setTimeout(() => {
                      setSuccessMessage(null);
                      onClose();
                    }, 600);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    user?.id === acc.id
                      ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-2xs">
                      {acc.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {acc.name}
                        {user?.id === acc.id && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.2 rounded-full font-semibold">
                            Active
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">{acc.role} • {acc.institution}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{acc.email}</span>
                    </div>
                  </div>

                  <CheckCircle2 className={`h-4 w-4 ${user?.id === acc.id ? "text-blue-600" : "text-slate-300"}`} />
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SETTINGS & LAB API KEYS */}
          {tab === "settings" && user && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Clearance
                  </span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    Verified Scholar
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                <p className="text-xs text-slate-600">{user.role} • {user.institution}</p>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ORCID: <strong>{user.orcidId || "0000-0002-1825-0097"}</strong></span>
                  <span>Publications: <strong>{user.publicationsCount}</strong></span>
                </div>
              </div>

              {/* Lab API Key Section */}
              <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Key className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">Lab REST API Key</span>
                  </div>
                  <button
                    onClick={() => generateNewApiKey()}
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Rotate Key</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700">
                  <span className="truncate mr-2">{user.apiKey || "ros_live_9482f7c81a293e"}</span>
                  <button
                    onClick={handleCopyKey}
                    className="text-slate-500 hover:text-slate-800 p-1 rounded"
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Use this key to authorize custom Python and CLI agent scripts against your local ResearchOS server.
                </p>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setTab("personas")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Switch Account</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setSuccessMessage("Signed out of session.");
                    setTimeout(() => {
                      setSuccessMessage(null);
                      setTab("signin");
                    }, 500);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
