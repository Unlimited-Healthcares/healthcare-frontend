import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

type LanguageCode = 'en' | 'fr' | 'es';

type Translations = Record<string, string>;

const en: Translations = {
    settings: "Settings",
    personalInfo: "Personal Information",
    updateBasic: "Update your name, bio, and health data",
    securityPass: "Security & Password",
    manage2FA: "Manage password and 2FA settings",
    profileVis: "Profile Visibility",
    allowOthers: "Allow others to find your public profile",
    accountPrivacy: "Account & Privacy",
    notifications: "Notifications",
    generalNotif: "General Notifications",
    enableAlerts: "Enable all system alerts",
    emailUpdates: "Email Updates",
    smsAlerts: "SMS Alerts",
    displayExp: "Display & Experience",
    biometric: "Biometric Unlock",
    useFaceID: "Use FaceID or Fingerprint",
    darkMode: "Dark Mode",
    switchDark: "Switch to cinematic dark UI",
    language: "Language",
    prefLanguage: "Preferred app language",
    support: "Support",
    helpCenter: "Help Center",
    legal: "Legal",
    privacyPolicy: "Privacy Policy"
};

const fr: Translations = {
    settings: "Paramètres",
    personalInfo: "Informations Personnelles",
    updateBasic: "Mettez à jour votre nom, bio et données de santé",
    securityPass: "Sécurité et Mot de passe",
    manage2FA: "Gérer le mot de passe et la 2FA",
    profileVis: "Visibilité du Profil",
    allowOthers: "Permettre aux autres de trouver votre profil",
    accountPrivacy: "Compte et Confidentialité",
    notifications: "Notifications",
    generalNotif: "Notifications Générales",
    enableAlerts: "Activer toutes les alertes système",
    emailUpdates: "Mises à jour par Mèl",
    smsAlerts: "Alertes SMS",
    displayExp: "Affichage et Expérience",
    biometric: "Déverrouillage Biométrique",
    useFaceID: "Utiliser FaceID ou l'Empreinte",
    darkMode: "Mode Sombre",
    switchDark: "Passer à l'interface sombre cinématique",
    language: "Langue",
    prefLanguage: "Langue préférée de l'application",
    support: "Assistance",
    helpCenter: "Centre d'aide",
    legal: "Légal",
    privacyPolicy: "Politique de Confidentialité"
};

const es: Translations = {
    settings: "Ajustes",
    personalInfo: "Información Personal",
    updateBasic: "Actualiza tu nombre, bio y datos de salud",
    securityPass: "Seguridad y Contraseña",
    manage2FA: "Gestionar contraseña y ajustes 2FA",
    profileVis: "Visibilidad del Perfil",
    allowOthers: "Permitir que otros encuentren tu perfil público",
    accountPrivacy: "Cuenta y Privacidad",
    notifications: "Notificaciones",
    generalNotif: "Notificaciones Generales",
    enableAlerts: "Habilitar todas las alertas del sistema",
    emailUpdates: "Actualizaciones por Correo",
    smsAlerts: "Alertas SMS",
    displayExp: "Pantalla y Experiencia",
    biometric: "Desbloqueo Biométrico",
    useFaceID: "Usar FaceID o Huella digital",
    darkMode: "Modo Oscuro",
    switchDark: "Cambiar a interfaz oscura cinemática",
    language: "Idioma",
    prefLanguage: "Idioma preferido de la aplicación",
    support: "Soporte",
    helpCenter: "Centro de Ayuda",
    legal: "Legal",
    privacyPolicy: "Política de Privacidad"
};

const dictionaries: Record<LanguageCode, Translations> = { en, fr, es };

interface LanguageContextType {
    language: LanguageCode;
    t: (key: string) => string;
    changeLanguage: (lang: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    t: (key) => key,
    changeLanguage: () => { }
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>('en');

    useEffect(() => {
        Preferences.get({ key: 'uhc_language' }).then(({ value }) => {
            if (value === 'fr' || value === 'es' || value === 'en') {
                setLanguage(value as LanguageCode);
            }
        });
    }, []);

    const changeLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        Preferences.set({ key: 'uhc_language', value: lang });
    };

    const t = (key: string): string => {
        const dict = dictionaries[language];
        return dict[key] || dictionaries['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    return useContext(LanguageContext);
};
