import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/services/userApi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
    ArrowLeft,
    Settings,
    Bell,
    Lock,
    User,
    Smartphone,
    Globe,
    Moon,
    Shield,
    Loader2,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

const SettingsPage: React.FC = () => {
    const { t, changeLanguage } = useTranslation();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { user, profile, loading: authLoading } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const [preferences, setPreferences] = useState({
        notifications: (profile as any)?.preferences?.notifications ?? true,
        emailUpdates: (profile as any)?.preferences?.emailUpdates ?? true,
        smsUpdates: (profile as any)?.preferences?.smsUpdates ?? false,
        pushNotifications: (profile as any)?.preferences?.pushNotifications ?? true,
        language: (profile as any)?.preferences?.language ?? 'en',
        timezone: (profile as any)?.preferences?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        profileVisibility: (profile as any)?.preferences?.profileVisibility ?? true,
        biometricEnabled: (profile as any)?.preferences?.biometricEnabled ?? false
    });
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometryType, setBiometryType] = useState<string>('');

    // Load actual biometric state from Capacitor Preferences asynchronously
    useEffect(() => {
        const loadBiometricPrefs = async () => {
            const { value } = await Preferences.get({ key: 'uhc_biometric_enabled' });
            if (value === 'true') {
                setPreferences(prev => ({ ...prev, biometricEnabled: true }));
            }
        };
        loadBiometricPrefs();
    }, []);

    // Initial check for biometric availability
    useEffect(() => {
        const checkBiometric = async () => {
            try {
                const result = await NativeBiometric.isAvailable();
                setBiometricAvailable(result.isAvailable);
                if (result.isAvailable) {
                    setBiometryType(String(result.biometryType) || 'biometric');
                }
            } catch (err) {
                console.warn('Biometric not available', err);
                setBiometricAvailable(false);
            }
        };
        checkBiometric();
    }, []);

    // Update internal state when profile changes (e.g. after sync)
    useEffect(() => {
        const profilePrefs = (profile as any)?.preferences;
        if (profilePrefs) {
            setPreferences(prev => ({
                ...prev,
                ...profilePrefs
            }));
        }
    }, [profile]);

    const handleToggle = async (key: keyof typeof preferences) => {
        const newValue = !preferences[key];
        const updatedPreferences = { ...preferences, [key]: newValue };
        setPreferences(updatedPreferences);

        try {
            setIsUpdating(true);
            await userApi.updatePreferences(updatedPreferences);
            toast.success('Preference synchronization successful');
        } catch (error) {
            setPreferences(prev => ({ ...prev, [key]: !newValue }));
            toast.error('Failed to sync settings with server');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLanguageChange = async (value: string) => {
        const updatedPreferences = { ...preferences, language: value };
        setPreferences(updatedPreferences);
        changeLanguage(value as 'en' | 'fr' | 'es');

        try {
            setIsUpdating(true);
            await userApi.updatePreferences(updatedPreferences);
            toast.success(`Language changed to ${value === 'en' ? 'English' : value === 'fr' ? 'French' : 'Spanish'}`);
        } catch (error) {
            setPreferences(prev => ({ ...prev, language: preferences.language }));
            changeLanguage(preferences.language as 'en' | 'fr' | 'es');
            toast.error('Failed to update language');
        } finally {
            setIsUpdating(false);
        }
    }

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        toast.success(`Theme switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`);
    };

    const getBiometricLabel = () => {
        if (!biometryType) return t('biometric');
        if (biometryType.toLowerCase().includes('face')) return 'Face ID';
        if (biometryType.toLowerCase().includes('finger')) return 'Fingerprint';
        if (biometryType.toLowerCase().includes('iris')) return 'Iris Scan';
        return 'Biometric';
    };

    const toggleBiometric = async () => {
        const nextValue = !preferences.biometricEnabled;

        // Skip hardware check if we are in browser/web for testing purposes
        if (!Capacitor.isNativePlatform()) {
            setPreferences(prev => ({ ...prev, biometricEnabled: nextValue }));
            await Preferences.set({ key: 'uhc_biometric_enabled', value: String(nextValue) });
            toast.success(nextValue ? `Biometric enabled (Simulation Mode)` : 'Biometric disabled');

            // Sync with backend
            try {
                await userApi.updatePreferences({ ...preferences, biometricEnabled: nextValue });
            } catch (err) {
                console.error('Failed to sync biometric preference to backend', err);
            }
            return;
        }

        if (nextValue) {
            // Check availability again
            try {
                const res = await NativeBiometric.isAvailable();
                if (!res.isAvailable) {
                    toast.error('Biometric authentication is not supported or setup on this device');
                    return;
                }

                // Small hardware readiness delay to prevent race conditions on mobile
                await new Promise(resolve => setTimeout(resolve, 500));

                // Verify identity to enable
                await NativeBiometric.verifyIdentity({
                    reason: `Enable ${getBiometricLabel()} access for your healthcare vault`,
                    title: `${getBiometricLabel()} Setup`,
                    subtitle: "Security Authentication",
                    description: `Confirm your identity to activate secure ${getBiometricLabel()} protection for your medical records.`,
                    negativeButtonText: "Cancel",
                    useFallback: true
                });
            } catch (err: any) {
                console.error('Biometric enablement failed:', err);
                // Handle user cancellation gracefully
                if (err.message?.includes('User canceled') || err.message?.includes('cancel')) {
                    return;
                }
                toast.error(`Verification failed: ${err.message || 'Unknown error'}. Please ensure your device biometrics are properly set up.`);
                return;
            }
        }

        // Apply state locally
        setPreferences(prev => ({ ...prev, biometricEnabled: nextValue }));
        await Preferences.set({ key: 'uhc_biometric_enabled', value: String(nextValue) });

        // Sync with hardware and backend
        try {
            setIsUpdating(true);
            const syncPrefs = { ...preferences, biometricEnabled: nextValue };
            await userApi.updatePreferences(syncPrefs);
            toast.success(nextValue ? 'Biometric enabled & saved to cloud' : 'Biometric disabled & saved to cloud');
        } catch (error) {
            toast.error('Local preference updated, but failed to reach cloud database');
        } finally {
            setIsUpdating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 safe-area-pt">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="p-2 touch-target-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
                    </div>
                    {isUpdating && (
                        <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-widest">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Syncing
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* User Quick Info */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                        {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Healthcare User'}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800">
                        {user?.roles?.[0] || 'User'}
                    </Badge>
                </div>

                {/* Account Section */}
                <section className="space-y-3">
                    <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('accountPrivacy')}</h3>
                    <Card className="overflow-hidden dark:bg-slate-900 dark:border-slate-800 shadow-sm border-gray-100">
                        <CardContent className="p-0">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                                        <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('personalInfo')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('updateBasic')}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                            </button>
                            <Separator className="dark:bg-slate-800" />
                            <button
                                onClick={() => navigate('/security')}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                                        <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('securityPass')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('manage2FA')}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-slate-600" />
                            </button>
                            <Separator className="dark:bg-slate-800" />
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                                        <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('profileVis')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('allowOthers')}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.profileVisibility}
                                    onCheckedChange={() => handleToggle('profileVisibility')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Notifications Section */}
                <section className="space-y-3">
                    <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('notifications')}</h3>
                    <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-sm border-gray-100">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
                                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('generalNotif')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('enableAlerts')}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.notifications}
                                    onCheckedChange={() => handleToggle('notifications')}
                                />
                            </div>
                            <Separator className="dark:bg-slate-800" />
                            <div className="flex items-center justify-between p-4 px-6">
                                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('emailUpdates')}</p>
                                <Switch
                                    checked={preferences.emailUpdates}
                                    onCheckedChange={() => handleToggle('emailUpdates')}
                                />
                            </div>
                            <Separator className="dark:bg-slate-800" />
                            <div className="flex items-center justify-between p-4 px-6">
                                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('smsAlerts')}</p>
                                <Switch
                                    checked={preferences.smsUpdates}
                                    onCheckedChange={() => handleToggle('smsUpdates')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Display Section */}
                <section className="space-y-3">
                    <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('displayExp')}</h3>
                    <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-sm border-gray-100">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors">
                                        <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('biometric')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('useFaceID')}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preferences.biometricEnabled}
                                    onCheckedChange={toggleBiometric}
                                />
                            </div>
                            <Separator className="dark:bg-slate-800" />
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 dark:bg-slate-700 rounded-lg transition-colors">
                                        <Moon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('darkMode')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('switchDark')}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={toggleTheme}
                                />
                            </div>
                            <Separator className="dark:bg-slate-800" />
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                                        <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{t('language')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('prefLanguage')}</p>
                                    </div>
                                </div>
                                <div className="w-32">
                                    <Select
                                        value={preferences.language}
                                        onValueChange={handleLanguageChange}
                                    >
                                        <SelectTrigger className="h-9 dark:bg-slate-800 dark:border-slate-700">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Legal & App Info */}
                <section className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/support')}
                            className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md"
                        >
                            <span className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase">{t('support')}</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                {t('helpCenter')} <ExternalLink className="h-3 w-3" />
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/privacy-policy')}
                            className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md"
                        >
                            <span className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase">{t('legal')}</span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                {t('privacyPolicy')} <ExternalLink className="h-3 w-3" />
                            </span>
                        </Button>
                    </div>

                    <div className="text-center py-6">
                        <p className="text-[10px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.3em]">Unlimited Healthcare v1.1.15</p>
                        <p className="text-[9px] text-gray-400 dark:text-slate-600 mt-1">© 2026 Unlimited Healthcare Services. All rights reserved.</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SettingsPage;
