import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Lock,
    History,
    Download,
    Trash2,
    Fingerprint,
    Smartphone,
    Monitor,
    Globe,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    KeyIcon
} from 'lucide-react';
import { complianceApi, AuditLog, ConsentRecord } from '@/services/complianceApi';
import { notificationApi, NotificationPreference, DeliveryMethod } from '@/services/notificationApi';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Preferences } from '@capacitor/preferences';

const UserSecurityPage: React.FC = () => {
    const { user } = useAuth();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [consents, setConsents] = useState<ConsentRecord[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [activityRes, consentRes, prefRes, pref2FA] = await Promise.all([
                    complianceApi.getUserActivity(),
                    complianceApi.getConsents(),
                    notificationApi.getPreferences(),
                    Preferences.get({ key: '2fa_enabled' })
                ]);
                setLogs(activityRes.logs);
                setConsents(consentRes);
                setPreferences(prefRes);
                setIs2FAEnabled(pref2FA.value === 'true');
            } catch (err) {
                console.error('Failed to fetch security data', err);
                toast.error('Could not load security information');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExportData = async () => {
        const exportPromise = (async () => {
            const data = await complianceApi.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `healthcare_data_export_${format(new Date(), 'yyyy-MM-dd')}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            return data;
        })();

        toast.promise(exportPromise, {
            loading: 'Preparing your data export...',
            success: 'Data exported successfully! Your download has started.',
            error: 'Failed to export data'
        });
    };

    const handleDeleteAccount = () => {
        toast.info('Please contact support for account deletion requests to satisfy regulatory requirements.');
    };

    const handleToggle2FA = async () => {
        const newValue = !is2FAEnabled;
        setIs2FAEnabled(newValue);
        await Preferences.set({ key: '2fa_enabled', value: String(newValue) });
        toast.success(newValue ? 'Two-Factor Authentication enabled successfully!' : 'Two-Factor Authentication disabled.');
    };

    const handleTogglePreference = async (field: keyof NotificationPreference) => {
        if (!preferences) return;

        const cycle: DeliveryMethod[] = ['none', 'email', 'push', 'both'];
        const currentMethod = preferences[field] as DeliveryMethod;
        const currentIndex = cycle.indexOf(currentMethod);
        const nextMethod = cycle[(currentIndex + 1) % cycle.length];

        try {
            toast.loading('Updating preferences...');
            const updated = await notificationApi.updatePreferences({ [field]: nextMethod });
            setPreferences(updated);
            toast.dismiss();
            toast.success('Preferences updated!');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to update preference');
        }
    };

    const getDeviceIcon = (userAgent: string) => {
        if (/mobile/i.test(userAgent)) return <Smartphone className="h-4 w-4" />;
        return <Monitor className="h-4 w-4" />;
    };

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8 space-y-8 max-w-[1200px] mx-auto pb-48 sm:pb-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        Security & Privacy
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your account security, privacy settings, and data compliance.</p>
                </div>

                {!is2FAEnabled && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-pulse">
                        <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
                        <div>
                            <h3 className="text-rose-900 font-black tracking-tight text-sm">MANDATORY SECURITY REQUIREMENT</h3>
                            <p className="text-rose-700 text-xs mt-1 font-medium leading-relaxed">
                                You must use Two-Factor Authentication (2FA) to protect your account. Your account is currently vulnerable.
                                Please enable 2FA in the Security Recommendations section below immediately to comply with healthcare data protection standards.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Security Overview Cards */}
                    <Card className="border-none shadow-premium bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <ShieldCheck className="h-5 w-5" />
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                                    <span className="text-sm">KYC Status</span>
                                    {user?.kycStatus === 'APPROVED' ? (
                                        <div className="flex items-center gap-1 text-emerald-300">
                                            <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    ) : user?.kycStatus === 'PENDING' ? (
                                        <Badge className="bg-amber-100/20 text-amber-100 border-none px-2 py-0">Pending</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-white border-white/30 text-[10px] tracking-wider uppercase">Unverified</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-2xl">
                                    <span className="text-sm">Two-Factor Auth</span>
                                    {is2FAEnabled ? (
                                        <Badge className="bg-emerald-100/20 text-emerald-100 border-none px-2 py-0 text-[10px] uppercase tracking-wider">Active</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-white border-white/30 text-[10px] uppercase tracking-wider">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-white rounded-3xl md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="h-5 w-5 text-indigo-600" />
                                Security Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm">Two-Factor Authentication</h4>
                                        <p className="text-xs text-amber-700">Add an extra layer of security to your account to prevent unauthorized access.</p>
                                        <Button size="sm" variant="outline" className="mt-2 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl px-4" onClick={handleToggle2FA}>
                                            {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-600" />
                                <CardTitle>Recent Activity</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">View All</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 italic">No recent security activity found.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-2.5 rounded-2xl",
                                                    log.action.includes('FAILED') ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {log.action.includes('LOGIN') ? <Fingerprint className="h-5 w-5" /> : <KeyIcon className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</h4>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                                                            <Globe className="h-3 w-3" /> {log.ipAddress}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            {getDeviceIcon(log.userAgent)} {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {log.action.includes('FAILED') && <Badge className="bg-rose-100 text-rose-700 border-none px-2 py-0">Risk Detected</Badge>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        {/* Data & Compliance */}
                        <Card className="border-none shadow-premium bg-white rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-600" />
                                    Data & Compliance
                                </CardTitle>
                                <CardDescription>Manage your rights under HIPAA and GDPR.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Download My Data</h4>
                                        <p className="text-xs text-gray-500">Get a copy of all your medical and profile data (GDPR Portability).</p>
                                    </div>
                                    <Button onClick={handleExportData} variant="outline" className="rounded-xl px-6">
                                        <Download className="h-4 w-4 mr-2" />
                                        Request Export
                                    </Button>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Account Deletion</h4>
                                        <p className="text-xs text-rose-500 font-medium">Permanently delete your account and data (Right to be Forgotten).</p>
                                    </div>
                                    <Button onClick={handleDeleteAccount} variant="ghost" className="text-rose-600 hover:bg-rose-50 rounded-xl px-6">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Communication Preferences */}
                        <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-gray-900 leading-none">Communication Preferences</h3>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[280px]">
                                        Control how the system delivers clinical documents, booking updates, and security alerts to your devices.
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {[
                                        { id: 'system', label: 'System Notifications', desc: 'Critical alerts and health updates' },
                                        { id: 'message', label: 'Push Notifications', desc: 'Real-time message alerts' },
                                        { id: 'appointment', label: 'Appointment Reminders', desc: 'Alerts before your scheduled visits' },
                                    ].map((pref) => {
                                        const currentVal = preferences ? (preferences[pref.id as keyof NotificationPreference] as string) : 'both';
                                        return (
                                            <div key={pref.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{pref.label}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{pref.desc}</p>
                                                </div>
                                                <Badge
                                                    onClick={() => handleTogglePreference(pref.id as keyof NotificationPreference)}
                                                    className={cn(
                                                        "border-none cursor-pointer transition-all duration-200 px-3 py-1",
                                                        currentVal === 'none'
                                                            ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
                                                    )}
                                                >
                                                    {currentVal === 'both' ? 'Email & Push' :
                                                        currentVal === 'email' ? 'Email Only' :
                                                            currentVal === 'push' ? 'Push Only' : 'Disabled'}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Consents */}
                        <Card className="border-none shadow-premium bg-white rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-lg px-0 flex items-center gap-2">
                                    <Fingerprint className="h-5 w-5 text-emerald-600" />
                                    Privacy Consents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {consents.length === 0 ? (
                                    <div className="p-6 text-center space-y-4">
                                        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                            <Shield className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium text-balance">
                                            You must give explicit consent to use this app and authorize Unlimited Healthcare to be responsible for your data protection.
                                        </p>
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg hover:shadow-xl transition-all h-12"
                                            onClick={async () => {
                                                try {
                                                    const result = await complianceApi.recordConsent({
                                                        consentType: 'DATA_PROTECTION',
                                                        consentGiven: true
                                                    });
                                                    setConsents(prev => [...prev, result]);
                                                    toast.success('Privacy Consent Recorded. Your data is now fully protected.');
                                                } catch (err) {
                                                    toast.error('Failed to record consent. Please try again.');
                                                }
                                            }}
                                        >
                                            <ShieldCheck className="w-5 h-5 mr-2" />
                                            Grant Mandatory Consent
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {consents.map(consent => (
                                            <div key={consent.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{consent.consentType}</h4>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">Accepted on {format(new Date(consent.consentDate), 'MMM dd, yyyy')}</p>
                                                </div>
                                                <Badge className="bg-emerald-50 text-emerald-700 border-none">Active</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserSecurityPage;

/**
 * Helper function for class names
 */
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
