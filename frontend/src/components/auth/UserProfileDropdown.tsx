"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Shield, School, ChevronDown, LogOut, Settings, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserProfileDropdownProps {
  onOpenProfileModal: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onOpenProfileModal }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenProfileModal}
        className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm"
      >
        <User className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs group"
      >
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
          {user.avatar}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate max-w-[130px]">
            {user.name}
          </p>
          <span className="text-[10px] font-semibold text-slate-400 block truncate max-w-[130px]">
            {user.role}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 space-y-3 animate-fade-in text-xs">
          <div className="border-b border-slate-100 pb-3">
            <p className="font-extrabold text-sm text-slate-900">{user.name}</p>
            <p className="text-slate-500 font-medium text-[11px]">{user.email}</p>
            <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/70">
              <Award className="h-3 w-3" />
              <span>{user.role}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex items-center space-x-2">
              <School className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium truncate">{user.institution}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium truncate">{user.labName}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfileModal();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Edit Profile & Lab</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
