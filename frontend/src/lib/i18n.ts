import { useSettingsStore, type Language } from '../stores/settingsStore'

const translations = {
  en: {
    appName: 'CrashZero',
    navHome: 'Home',
    navMap: 'Map',
    navComplaint: 'Complaint',
    navAI: 'AI',
    settings: 'Settings',
    language: 'Language',
    about: 'About',
    theme: 'Theme',
    accessibility: 'Accessibility',
    interface: 'Interface',
    preferences: 'Preferences',
    settingsDescription: 'Customize your CrashZero experience.',
    languageDescription: 'Select your preferred language.',
    homeSubtitle: 'Road Safety Transparency',
    homeDescription:
      'AI-powered citizen transparency for roads, budgets, contractors, and safety alerts across India.',
    quickMap: 'Open Map',
    quickReport: 'Report Issue',
    quickAI: 'AI Assistant',
    quickDashboard: 'Dashboard',
    reportIssue: 'Report Issue',
    fileComplaint: 'File Complaint',
    aiTitle: 'CrashZero AI',
    aiAssistant: 'Assistant',
    aiPlaceholder: 'Ask a question about this road...',
    sendMessage: 'Send message',
    generateRti: 'Generate RTI request',
  },
  hi: {
    appName: 'क्रैशज़ीरो',
    navHome: 'होम',
    navMap: 'मानचित्र',
    navComplaint: 'शिकायत',
    navAI: 'AI',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    about: 'परिचय',
    theme: 'थीम',
    accessibility: 'पहुंच',
    interface: 'इंटरफेस',
    preferences: 'प्राथमिकताएं',
    settingsDescription: 'अपना क्रैशज़ीरो अनुभव अनुकूलित करें।',
    languageDescription: 'अपनी पसंदीदा भाषा चुनें।',
    homeSubtitle: 'सड़क सुरक्षा पारदर्शिता',
    homeDescription:
      'भारत भर में सड़कों, बजट, ठेकेदारों और सुरक्षा अलर्ट के लिए नागरिक पारदर्शिता।',
    quickMap: 'मानचित्र खोलें',
    quickReport: 'समस्या रिपोर्ट करें',
    quickAI: 'AI सहायक',
    quickDashboard: 'डैशबोर्ड',
    reportIssue: 'समस्या रिपोर्ट करें',
    fileComplaint: 'शिकायत दर्ज करें',
    aiTitle: 'क्रैशज़ीरो AI',
    aiAssistant: 'सहायक',
    aiPlaceholder: 'इस सड़क के बारे में प्रश्न पूछें...',
    sendMessage: 'संदेश भेजें',
    generateRti: 'RTI अनुरोध बनाएं',
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function getTranslation(language: Language, key: TranslationKey) {
  return translations[language][key] ?? translations.en[key]
}

export function useI18n() {
  const language = useSettingsStore((state) => state.language)
  return {
    language,
    t: (key: TranslationKey) => getTranslation(language, key),
  }
}
