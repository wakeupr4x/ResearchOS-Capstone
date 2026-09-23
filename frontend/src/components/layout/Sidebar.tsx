"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  MessageSquare,
  Columns,
  Sparkles,
  FileEdit,
  PenTool,
  Users,
  Cpu,
  PlusCircle,
  FileSearch,
  BookMarked,
  SearchCode,
  ShieldCheck,
  Bot,
  FileSpreadsheet,
  Quote,
  TableProperties,
  Workflow,
} from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface SidebarProps {
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload }) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [papersCount, setPapersCount] = useState<number | null>(null);

  useEffect(() => {
    api.getStats()
      .then((stats) => {
        setPapersCount(stats.papers_count);
      })
      .catch(() => {});
  }, [pathname]);

  const NAV_SECTIONS = [
    {
      title: "Core Workspace",
      items: [
        { name: t("nav.dashboard"), href: "/", icon: LayoutDashboard },
        { name: t("nav.library"), href: "/library", icon: BookOpen, badge: papersCount !== null ? `${papersCount}` : undefined },
        { name: t("nav.chat_pdf"), href: "/chat-pdf", icon: FileSearch, badge: "Interactive" },
        { name: t("nav.chat"), href: "/chat", icon: MessageSquare },
      ],
    },
    {
      title: "AI Scientific Tools",
      items: [
        { name: t("nav.studio"), href: "/studio", icon: PenTool, badge: "Pro" },
        { name: t("nav.literature_review"), href: "/literature-review", icon: BookMarked },
        { name: t("nav.compare"), href: "/compare", icon: Columns },
        { name: t("nav.topics"), href: "/topics", icon: SearchCode },
        { name: t("nav.paraphraser"), href: "/paraphraser", icon: Sparkles },
      ],
    },
    {
      title: "Intelligence & Data",
      items: [
        { name: t("nav.diagrams"), href: "/diagrams", icon: Workflow, badge: "Mermaid" },
        { name: t("nav.extract_data"), href: "/extract-data", icon: TableProperties },
        { name: t("nav.citations"), href: "/citations", icon: Quote },
        { name: t("nav.ai_detector"), href: "/ai-detector", icon: ShieldCheck },
        { name: t("nav.agents"), href: "/agents", icon: Bot, badge: "Gallery" },
        { name: t("nav.templates"), href: "/templates", icon: FileSpreadsheet },
        { name: t("nav.discover"), href: "/discover", icon: Compass },
      ],
    },
    {
      title: "Collaboration & Logs",
      items: [
        { name: t("nav.collaboration"), href: "/collaboration", icon: Users, badge: "Lab" },
        { name: t("nav.notes"), href: "/notes", icon: FileEdit },
      ],
    },
  ];

  return (
    <aside className="w-68 border-r border-slate-200/90 bg-white/95 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs z-30">
      {/* Brand Header: Logo strictly in Inter font */}
      <div className="flex flex-col min-h-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition font-sans">
              R
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900 font-sans flex items-center">
                Research<span className="text-blue-600 ml-0.5">OS</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase font-mono">
                Scientific Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Upload Action Button */}
        <div className="px-4 pt-3.5 pb-2">
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2.5 text-xs font-bold text-white active:scale-98 transition shadow-sm shadow-blue-500/25"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t("btn.upload")}</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
                {section.title}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs font-bold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">ResearchOS AI Engine</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v1.2</span>
        </div>
      </div>
    </aside>
  );
};
