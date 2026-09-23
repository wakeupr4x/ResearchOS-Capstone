"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AcademicRole =
  | "Principal Investigator"
  | "Senior Researcher"
  | "Postdoctoral Fellow"
  | "PhD Candidate"
  | "Master's Student"
  | "Undergraduate Researcher";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AcademicRole;
  institution: string;
  labName: string;
  orcidId?: string;
  publicationsCount: number;
  apiKey?: string;
  token?: string;
  createdAt: string;
}

export const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: "usr-pi-01",
    name: "Dr. Pushkar Verma",
    email: "pushkar.verma@stanford.edu",
    avatar: "PV",
    role: "Principal Investigator",
    institution: "Stanford University / AI Research Lab",
    labName: "Neural Intelligence & Grounding Lab",
    orcidId: "0000-0002-1825-0097",
    publicationsCount: 18,
    apiKey: "ros_live_9482f7c81a293e",
    token: "jwt_token_stanford_pi_pushkar",
    createdAt: "2024-01-15",
  },
  {
    id: "usr-phd-02",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@oxford.ac.uk",
    avatar: "ER",
    role: "Postdoctoral Fellow",
    institution: "University of Oxford",
    labName: "Autonomous Systems & Robotics Group",
    orcidId: "0000-0003-4912-8821",
    publicationsCount: 9,
    apiKey: "ros_live_2841b9e07f43a1",
    token: "jwt_token_oxford_postdoc_elena",
    createdAt: "2024-03-22",
  },
  {
    id: "usr-grad-03",
    name: "Marcus Vance",
    email: "mvance@mit.edu",
    avatar: "MV",
    role: "PhD Candidate",
    institution: "MIT CSAIL",
    labName: "Spoken Language Systems & NLP",
    orcidId: "0000-0001-7734-1902",
    publicationsCount: 4,
    apiKey: "ros_live_5519c2a44d88e6",
    token: "jwt_token_mit_phd_marcus",
    createdAt: "2024-06-10",
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: AcademicRole;
    institution: string;
    labName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider: "google" | "github") => Promise<{ success: boolean }>;
  switchAccount: (account: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  generateNewApiKey: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(PRESET_ACCOUNTS[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("researchos_session_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate real auth validation
    if (!email || !password) {
      return { success: false, error: "Please enter your academic email and password." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const matched = PRESET_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    const initials = email.slice(0, 2).toUpperCase();

    const loggedUser: UserProfile = matched || {
      id: "usr-" + Date.now(),
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      avatar: initials,
      role: "PhD Candidate",
      institution: email.includes(".edu") || email.includes(".ac") ? "Affiliated University" : "Independent Research Institute",
      labName: "Academic Intelligence Lab",
      publicationsCount: 3,
      apiKey: "ros_live_" + Math.random().toString(36).substring(2, 12),
      token: "jwt_token_" + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUser(loggedUser);
    localStorage.setItem("researchos_session_user", JSON.stringify(loggedUser));
    return { success: true };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: AcademicRole;
    institution: string;
    labName?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: "Please fill in all required fields." };
    }
    if (data.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const initials = data.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      name: data.name,
      email: data.email,
      avatar: initials || "RS",
      role: data.role || "PhD Candidate",
      institution: data.institution || "Research Institution",
      labName: data.labName || "Computational Intelligence Lab",
      publicationsCount: 1,
      apiKey: "ros_live_" + Math.random().toString(36).substring(2, 12),
      token: "jwt_token_" + Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUser(newUser);
    localStorage.setItem("researchos_session_user", JSON.stringify(newUser));
    return { success: true };
  };

  const loginWithOAuth = async (provider: "google" | "github"): Promise<{ success: boolean }> => {
    const isGoogle = provider === "google";
    const oauthUser: UserProfile = {
      id: "usr-" + provider + "-" + Date.now(),
      name: isGoogle ? "Dr. Pushkar Verma" : "Pushkar Verma (GitHub Scholar)",
      email: isGoogle ? "pushkar.verma@stanford.edu" : "pushkar@github-academic.io",
      avatar: "PV",
      role: "Principal Investigator",
      institution: "Stanford University / AI Research Lab",
      labName: "Neural Intelligence & Grounding Lab",
      orcidId: "0000-0002-1825-0097",
      publicationsCount: 18,
      apiKey: "ros_live_" + Math.random().toString(36).substring(2, 12),
      token: "oauth_token_" + provider + "_" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUser(oauthUser);
    localStorage.setItem("researchos_session_user", JSON.stringify(oauthUser));
    return { success: true };
  };

  const switchAccount = (account: UserProfile) => {
    setUser(account);
    localStorage.setItem("researchos_session_user", JSON.stringify(account));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("researchos_session_user");
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("researchos_session_user", JSON.stringify(updated));
  };

  const generateNewApiKey = (): string => {
    const newKey = "ros_live_" + Math.random().toString(36).substring(2, 16);
    updateProfile({ apiKey: newKey });
    return newKey;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithCredentials,
        register,
        loginWithOAuth,
        switchAccount,
        logout,
        updateProfile,
        generateNewApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
