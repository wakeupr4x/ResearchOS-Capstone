"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "zh"
  | "ja"
  | "hi"
  | "ta"
  | "te"
  | "bn"
  | "mr"
  | "gu"
  | "kn";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    "nav.dashboard": "Home",
    "nav.library": "My Library",
    "nav.chat": "Research Chat",
    "nav.chat_pdf": "Chat with PDF",
    "nav.compare": "Compare Papers",
    "nav.studio": "AI Writer",
    "nav.literature_review": "Literature Review",
    "nav.discover": "Academic Discovery",
    "nav.topics": "Find Topics",
    "nav.paraphraser": "Paraphraser",
    "nav.citations": "Citation Generator",
    "nav.extract_data": "Extract Data",
    "nav.ai_detector": "AI Detector",
    "nav.agents": "Agent Gallery",
    "nav.templates": "Templates",
    "nav.diagrams": "Flowcharts & Diagrams",
    "nav.collaboration": "Collaboration",
    "nav.notes": "Research Notes",
    "nav.settings": "Settings",
    "btn.upload": "Upload New Paper",
    "btn.search": "Search",
    "badge.student": "Student Mode",
    "badge.professional": "Professional Mode",
  },
  hi: {
    "nav.dashboard": "मुख्य पृष्ठ",
    "nav.library": "मेरी लाइब्रेरी",
    "nav.chat": "रिसर्च चैट",
    "nav.chat_pdf": "PDF के साथ चैट",
    "nav.compare": "शोध पत्रों की तुलना",
    "nav.studio": "AI लेखक स्टूडियो",
    "nav.literature_review": "साहित्य समीक्षा",
    "nav.discover": "शैक्षणिक खोज",
    "nav.topics": "नए विषय खोजें",
    "nav.paraphraser": "वैज्ञानिक व्याख्याकार",
    "nav.citations": "प्रशंसापत्र / उद्धरण",
    "nav.extract_data": "डेटा निकालें",
    "nav.ai_detector": "AI विश्लेषक",
    "nav.agents": "रिसर्च एजेंट्स",
    "nav.templates": "शोध टेम्प्लेट्स",
    "nav.diagrams": "फ़्लोचार्ट एवं रेखाचित्र",
    "nav.collaboration": "सहयोग एवं लैब",
    "nav.notes": "शोध नोट्स",
    "nav.settings": "सेटिंग्स",
    "btn.upload": "नया पेपर अपलोड करें",
    "btn.search": "खोजें",
    "badge.student": "छात्र मोड (नोटबुकLM)",
    "badge.professional": "वैज्ञानिक मोड",
  },
  ta: {
    "nav.dashboard": "முகப்பு",
    "nav.library": "எனது நூலகம்",
    "nav.chat": "ஆராய்ச்சி உரையாடல்",
    "nav.chat_pdf": "PDF உடன் உரையாடு",
    "nav.compare": "ஆய்வுக் கட்டுரைகள் ஒப்பீடு",
    "nav.studio": "AI ஆய்வுக் கூடம்",
    "nav.literature_review": "இலக்கிய மதிப்பாய்வு",
    "nav.discover": "கல்விசார் கண்டுபிடிப்பு",
    "nav.topics": "ஆராய்ச்சி தலைப்புகள்",
    "nav.paraphraser": "மறுபெயர்ப்பாளர்",
    "nav.citations": "மேற்கோள் உருவாக்கி",
    "nav.extract_data": "தரவு பிரித்தெடுத்தல்",
    "nav.ai_detector": "AI கண்டறிதல்",
    "nav.agents": "ஆராய்ச்சி முகவர்கள்",
    "nav.templates": "வார்ப்புருக்கள்",
    "nav.diagrams": "பாய்வு விளக்கப்படங்கள்",
    "nav.collaboration": "ஆய்வக ஒத்துழைப்பு",
    "nav.notes": "ஆராய்ச்சிக் குறிப்புகள்",
    "nav.settings": "அமைப்புகள்",
    "btn.upload": "கட்டுரையை பதிவேற்று",
    "btn.search": "தேடு",
    "badge.student": "மாணவர் பயன்முறை",
    "badge.professional": "தொழில்முறை பயன்முறை",
  },
  te: {
    "nav.dashboard": "హోమ్ పేజీ",
    "nav.library": "నా లైబ్రరీ",
    "nav.chat": "పరిశోధన సంభాషణ",
    "nav.chat_pdf": "PDF తో చాట్",
    "nav.compare": "పేపర్ల పోలిక",
    "nav.studio": "AI రచనా స్టూడియో",
    "nav.literature_review": "సాహిత్య సమీక్ష",
    "nav.discover": "విద్యా పరిశోధనలు",
    "nav.topics": "పరిశోధనా అంశాలు",
    "nav.paraphraser": "శాస్త్రీయ రీరైటర్",
    "nav.citations": "సైటేషన్ జనరేటర్",
    "nav.extract_data": "డేటా వెలికితీత",
    "nav.ai_detector": "AI డిటెక్టర్",
    "nav.agents": "రీసెర్చ్ ఏజెంట్లు",
    "nav.templates": "టెంప్లేట్లు",
    "nav.diagrams": "ఫ్లోచార్ట్‌లు & రేఖాచిత్రాలు",
    "nav.collaboration": "ల్యాబ్ సహకారం",
    "nav.notes": "పరిశోధన నోట్స్",
    "nav.settings": "సెట్టింగ్‌లు",
    "btn.upload": "పేపర్‌ను అప్‌లోడ్ చేయండి",
    "btn.search": "శోధించండి",
    "badge.student": "విద్యార్థి మోడ్",
    "badge.professional": "ప్రొఫెషనల్ మోడ్",
  },
  bn: {
    "nav.dashboard": "মূল পাতা",
    "nav.library": "আমার লাইব্রেরি",
    "nav.chat": "গবেষণা চ্যাট",
    "nav.chat_pdf": "PDF এর সাথে চ্যাট",
    "nav.compare": "গবেষণাপত্র তুলনা",
    "nav.studio": "AI রাইটার স্টুডিও",
    "nav.literature_review": "সাহিত্য পর্যালোচনা",
    "nav.discover": "একাডেমিক আবিষ্কার",
    "nav.topics": "নতুন গবেষণা বিষয়",
    "nav.paraphraser": "প্যারাফ্রেজার",
    "nav.citations": "উদ্ধৃতি জেনারেটর",
    "nav.extract_data": "উপাত্ত নিষ্কাশন",
    "nav.ai_detector": "AI সনাক্তকরণ",
    "nav.agents": "গবেষণা এজেন্ট",
    "nav.templates": "টেমপ্লেট",
    "nav.diagrams": "ফ্লোচার্ট ও ডায়াগ্রাম",
    "nav.collaboration": "ল্যাব সহযোগিতা",
    "nav.notes": "গবেষণা নোট",
    "nav.settings": "সেটিংস",
    "btn.upload": "নতুন পেপার আপলোড করুন",
    "btn.search": "অনুসন্ধান",
    "badge.student": "ছাত্র মোড",
    "badge.professional": "পেশাদার মোড",
  },
  mr: {
    "nav.dashboard": "मुख्यपृष्ठ",
    "nav.library": "माझे ग्रंथालय",
    "nav.chat": "संशोधन गप्पा",
    "nav.chat_pdf": "PDF सोबत संवाद",
    "nav.compare": "संशोधन पत्रिका तुलना",
    "nav.studio": "AI लेखक स्टुडिओ",
    "nav.literature_review": "साहित्य पुनरावलोकन",
    "nav.discover": "शैक्षणिक शोध",
    "nav.topics": "संशोधन विषय",
    "nav.paraphraser": "वैज्ञानिक परिभाषक",
    "nav.citations": "संदर्भ जनरेटर",
    "nav.extract_data": "माहिती निष्कर्षण",
    "nav.ai_detector": "AI शोधक",
    "nav.agents": "संशोधन एजंट",
    "nav.templates": "नमुने",
    "nav.diagrams": "प्रवाह तक्ते व आकृत्या",
    "nav.collaboration": "प्रयोगशाळा सहयोग",
    "nav.notes": "नोंदी",
    "nav.settings": "सेटिंग्ज",
    "btn.upload": "शोधनिबंध अपलोड करा",
    "btn.search": "शोधा",
    "badge.student": "विद्यार्थी मोड",
    "badge.professional": "व्यावसायिक मोड",
  },
  gu: {
    "nav.dashboard": "મુખ્ય પૃષ્ઠ",
    "nav.library": "મારી લાઇબ્રેરી",
    "nav.chat": "સંશોધન ચેટ",
    "nav.chat_pdf": "PDF સાથે ચેટ",
    "nav.compare": "પેપર્સ સરખામણી",
    "nav.studio": "AI લેખક સ્ટુડિયો",
    "nav.literature_review": "સાહિત્ય સમીક્ષા",
    "nav.discover": "શૈક્ષણિક શોધ",
    "nav.topics": "સંશોધન વિષયો",
    "nav.paraphraser": "પેરાફ્રેઝર",
    "nav.citations": "સાયટેશન જનરેટર",
    "nav.extract_data": "ડેટા એક્સટ્રેક્ટ",
    "nav.ai_detector": "AI ડિટેક્ટર",
    "nav.agents": "સંશોધન એજન્ટો",
    "nav.templates": "ટેમ્પ્લેટ્સ",
    "nav.diagrams": "ફ્લોચાર્ટ અને આકૃતિઓ",
    "nav.collaboration": "લેબ સહયોગ",
    "nav.notes": "નોંધો",
    "nav.settings": "સેટિંગ્સ",
    "btn.upload": "પેપર અપલોડ કરો",
    "btn.search": "શોધો",
    "badge.student": "વિદ્યાર્થી મોડ",
    "badge.professional": "પ્રોફેશનલ મોડ",
  },
  kn: {
    "nav.dashboard": "ಮುಖಪುಟ",
    "nav.library": "ನನ್ನ ಲೈಬ್ರರಿ",
    "nav.chat": "ಸಂಶೋಧನಾ ಚಾಟ್",
    "nav.chat_pdf": "PDF ಜೊತೆ ಚಾಟ್",
    "nav.compare": "ಪ್ರಬಂಧಗಳ ಹೋಲಿಕೆ",
    "nav.studio": "AI ರೈಟರ್ ಸ್ಟುಡಿಯೋ",
    "nav.literature_review": "ಸಾಹಿತ್ಯ ವಿಮರ್ಶೆ",
    "nav.discover": "ಶೈಕ್ಷಣಿಕ ಶೋಧನೆ",
    "nav.topics": "ಸಂಶೋಧನಾ ವಿಷಯಗಳು",
    "nav.paraphraser": "ವೈಜ್ಞಾನಿಕ ರೀರೈಟರ್",
    "nav.citations": "ಉಲ್ಲೇಖ ಜನರೇಟರ್",
    "nav.extract_data": "ಡೇಟಾ ಹೊರತೆಗೆಯುವಿಕೆ",
    "nav.ai_detector": "AI ಪತ್ತೆಕಾರಕ",
    "nav.agents": "ಸಂಶೋಧನಾ ಏಜೆಂಟ್‌ಗಳು",
    "nav.templates": "ಟೆಂಪ್ಲೇಟ್‌ಗಳು",
    "nav.diagrams": "ಫ್ಲೋಚಾರ್ಟ್‌ಗಳು",
    "nav.collaboration": "ಪ್ರಯೋಗಾಲಯ ಸಹಯೋಗ",
    "nav.notes": "ಸಂಶೋಧನಾ ಟಿಪ್ಪಣಿಗಳು",
    "nav.settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "btn.upload": "ಪ್ರಬಂಧ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "btn.search": "ಹುಡುಕಿ",
    "badge.student": "ವಿದ್ಯಾರ್ಥಿ ಮೋಡ್",
    "badge.professional": "ವೃತ್ತಿಪರ ಮೋಡ್",
  },
  es: {
    "nav.dashboard": "Inicio",
    "nav.library": "Mi Biblioteca",
    "nav.chat": "Chat de Investigación",
    "nav.chat_pdf": "Chat con PDF",
    "nav.compare": "Comparar Artículos",
    "nav.studio": "Escritor IA",
    "nav.literature_review": "Revisión Bibliográfica",
    "nav.discover": "Descubrimiento Académico",
    "nav.topics": "Buscar Temas",
    "nav.paraphraser": "Parafraseador",
    "nav.citations": "Generador de Citas",
    "nav.extract_data": "Extraer Datos",
    "nav.ai_detector": "Detector de IA",
    "nav.agents": "Galería de Agentes",
    "nav.templates": "Plantillas",
    "nav.diagrams": "Diagramas y Flujogramas",
    "nav.collaboration": "Colaboración",
    "nav.notes": "Notas",
    "nav.settings": "Ajustes",
    "btn.upload": "Subir Artículo",
    "btn.search": "Buscar",
    "badge.student": "Modo Estudiante",
    "badge.professional": "Modo Profesional",
  },
  fr: {
    "nav.dashboard": "Accueil",
    "nav.library": "Ma Bibliothèque",
    "nav.chat": "Chat de Recherche",
    "nav.chat_pdf": "Chat avec PDF",
    "nav.compare": "Comparer les Articles",
    "nav.studio": "Rédacteur IA",
    "nav.literature_review": "Revue de Littérature",
    "nav.discover": "Découverte Académique",
    "nav.topics": "Trouver des Sujets",
    "nav.paraphraser": "Paraphraseur",
    "nav.citations": "Générateur de Citations",
    "nav.extract_data": "Extraire des Données",
    "nav.ai_detector": "Détecteur d'IA",
    "nav.agents": "Galerie d'Agents",
    "nav.templates": "Modèles",
    "nav.diagrams": "Diagrammes & Organigrammes",
    "nav.collaboration": "Collaboration",
    "nav.notes": "Notes",
    "nav.settings": "Paramètres",
    "btn.upload": "Importer un Article",
    "btn.search": "Rechercher",
    "badge.student": "Mode Étudiant",
    "badge.professional": "Mode Professionnel",
  },
  de: {
    "nav.dashboard": "Startseite",
    "nav.library": "Meine Bibliothek",
    "nav.chat": "Forschungs-Chat",
    "nav.chat_pdf": "Chat mit PDF",
    "nav.compare": "Artikel Vergleichen",
    "nav.studio": "KI-Autor",
    "nav.literature_review": "Literaturübersicht",
    "nav.discover": "Wissenschaftliche Entdeckung",
    "nav.topics": "Themen Finden",
    "nav.paraphraser": "Paraphrasierer",
    "nav.citations": "Zitier-Generator",
    "nav.extract_data": "Daten Extrahieren",
    "nav.ai_detector": "KI-Detektor",
    "nav.agents": "Agenten-Galerie",
    "nav.templates": "Vorlagen",
    "nav.diagrams": "Flussdiagramme",
    "nav.collaboration": "Kollaboration",
    "nav.notes": "Notizen",
    "nav.settings": "Einstellungen",
    "btn.upload": "Artikel Hochladen",
    "btn.search": "Suchen",
    "badge.student": "Studenten-Modus",
    "badge.professional": "Experten-Modus",
  },
  zh: {
    "nav.dashboard": "首页",
    "nav.library": "我的文献库",
    "nav.chat": "研究对话",
    "nav.chat_pdf": "PDF 智能问答",
    "nav.compare": "论文对比",
    "nav.studio": "AI 论文工坊",
    "nav.literature_review": "文献综述",
    "nav.discover": "学术前沿探索",
    "nav.topics": "研究选题推荐",
    "nav.paraphraser": "学术改写润色",
    "nav.citations": "参考文献生成器",
    "nav.extract_data": "提取实验参数",
    "nav.ai_detector": "AI 查重检测",
    "nav.agents": "智能研究助理",
    "nav.templates": "学术期刊模板",
    "nav.diagrams": "系统架构流程图",
    "nav.collaboration": "实验室协作",
    "nav.notes": "研究笔记",
    "nav.settings": "系统设置",
    "btn.upload": "上传新论文",
    "btn.search": "检索",
    "badge.student": "学生模式",
    "badge.professional": "专家模式",
  },
  ja: {
    "nav.dashboard": "ホーム",
    "nav.library": "マイライブラリ",
    "nav.chat": "リサーチ対話",
    "nav.chat_pdf": "PDFチャット",
    "nav.compare": "論文比較",
    "nav.studio": "AI論文執笔",
    "nav.literature_review": "文献レビュー",
    "nav.discover": "学術探索",
    "nav.topics": "テーマ探索",
    "nav.paraphraser": "パラフレーザー",
    "nav.citations": "引用生成",
    "nav.extract_data": "データ抽出",
    "nav.ai_detector": "AI判定",
    "nav.agents": "AIエージェント",
    "nav.templates": "論文テンプレート",
    "nav.diagrams": "フローチャート・図表",
    "nav.collaboration": "研究室コラボ",
    "nav.notes": "研究ノート",
    "nav.settings": "設定",
    "btn.upload": "論文をアップロード",
    "btn.search": "検索",
    "badge.student": "学生モード",
    "badge.professional": "専門家モード",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("researchos_lang") as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("researchos_lang", lang);
  };

  const t = (key: string): string => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return currentDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
