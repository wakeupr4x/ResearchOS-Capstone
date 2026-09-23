"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { UploadModal } from "@/components/papers/UploadModal";
import { AuthModal } from "@/components/auth/AuthModal";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex gradient-bg">
      {/* Sidebar */}
      <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenAuthModal={() => setIsAuthOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Global Upload Paper Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("paper-uploaded"));
        }}
      />

      {/* User Auth & Lab Access Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};
