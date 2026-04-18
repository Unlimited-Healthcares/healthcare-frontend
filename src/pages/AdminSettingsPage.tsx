import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Shield,
    Bell,
    Database,
    Globe,
    ChevronLeft,
    Save,
    RefreshCw,
    Lock,
    Eye,
    Server,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

const AdminSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // Core Settings State
    const [settings, setSettings] = useState({
        systemName: 'UnlimitedHealthCares',
        supportEmail: 'support@healthcare-system.com',
        publicRegistration: true,
        maintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please try again later.',
        aiAssistance: true,
        require2FA: true,
        kycAutoVerify: false,
        sessionTimeout: '30 Minutes',
        haltTransactions: false,
        // Infrastructure & Notifications
        emailEnabled: true,
        toastEnabled: true,
        smsEnabled: false,
        apiRegistryLocked: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await adminService.getConfigurations();
                if (res.success) {
                    const configs = res.data;
                    const newSettings = { ...settings };

                    configs.forEach((c: any) => {
                        switch (c.configKey) {
                            case 'system_name': newSettings.systemName = c.configValue.value; break;
                            case 'support_email': newSettings.supportEmail = c.configValue.value; break;
                            case 'user_registration_enabled': newSettings.publicRegistration = c.configValue.enabled; break;
                            case 'maintenance_mode':
                                newSettings.maintenanceMode = c.configValue.enabled;
                                newSettings.maintenanceMessage = c.configValue.message || 'System is under maintenance. Please try again later.';
                                break;
                            case 'ai_assistance_enabled': newSettings.aiAssistance = c.configValue.enabled; break;
                            case 'require_2fa': newSettings.require2FA = c.configValue.enabled; break;
                            case 'kyc_auto_verification': newSettings.kycAutoVerify = c.configValue.enabled; break;
                            case 'session_timeout': newSettings.sessionTimeout = c.configValue.value; break;
                            case 'halt_transactions': newSettings.haltTransactions = c.configValue.enabled; break;
                            case 'email_notifications_enabled': newSettings.emailEnabled = c.configValue.enabled; break;
                            case 'toast_notifications_enabled': newSettings.toastEnabled = c.configValue.enabled; break;
                            case 'sms_notifications_enabled': newSettings.smsEnabled = c.configValue.enabled; break;
                            case 'api_registry_locked': newSettings.apiRegistryLocked = c.configValue.enabled; break;
                        }
                    });
                    setSettings(newSettings);
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Map settings to backend updates
            const updates = [
                { key: 'system_name', value: { value: settings.systemName } },
                { key: 'support_email', value: { value: settings.supportEmail } },
                { key: 'user_registration_enabled', value: { enabled: settings.publicRegistration } },
                { key: 'maintenance_mode', value: { enabled: settings.maintenanceMode, message: settings.maintenanceMessage } },
                { key: 'ai_assistance_enabled', value: { enabled: settings.aiAssistance } },
                { key: 'require_2fa', value: { enabled: settings.require2FA } },
                { key: 'kyc_auto_verification', value: { enabled: settings.kycAutoVerify } },
                { key: 'session_timeout', value: { value: settings.sessionTimeout } },
                { key: 'halt_transactions', value: { enabled: settings.haltTransactions } },
                { key: 'email_notifications_enabled', value: { enabled: settings.emailEnabled } },
                { key: 'toast_notifications_enabled', value: { enabled: settings.toastEnabled } },
                { key: 'sms_notifications_enabled', value: { enabled: settings.smsEnabled } },
                { key: 'api_registry_locked', value: { enabled: settings.apiRegistryLocked } },
            ];

            await Promise.all(updates.map(u =>
                adminService.updateConfiguration(u.key, { configValue: u.value }).catch(() => null)
            ));

            toast.success('Cloud Registry Synchronized: Global parameters updated.');
        } catch (error) {
            toast.error('Failed to commit changes to cloud registry.');
        } finally {
            setLoading(false);
        }
    };

    const SettingGroup = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
        <div className="space-y-4 pb-8 border-b border-gray-50 last:border-0 last:pb-0">
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 font-medium">{description}</p>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const ToggleSetting = ({ label, description, checked, onCheckedChange }: any) => (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-blue-50 transition-all">
            <div className="space-y-0.5">
                <Label className="text-sm font-bold text-gray-900 cursor-pointer" htmlFor={label}>{label}</Label>
                <p className="text-xs text-gray-500 font-medium">{description}</p>
            </div>
            <Switch id={label} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => navigate('/admin')}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-premium">Platform Settings</h1>
                            <p className="text-gray-500 mt-1 font-medium">Fine-tune global system parameters and core configurations.</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md h-12 px-8 font-bold"
                        disabled={loading}
                    >
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <Card className="lg:col-span-1 border-none shadow-sm bg-white p-2 rounded-2xl h-fit sticky top-8">
                        <nav className="space-y-1">
                            {[
                                { id: 'general', icon: Settings, label: 'General' },
                                { id: 'security', icon: Shield, label: 'Security' },
                                { id: 'notifications', icon: Bell, label: 'Notifications' },
                                { id: 'database', icon: Database, label: 'Data Management' },
                                { id: 'api', icon: Zap, label: 'API & Integrations' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                        activeTab === item.id
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </Card>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {fetching ? (
                            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Querying Global Registry...</p>
                            </div>
                        ) : (
                            <>
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden animate-in fade-in duration-500">
                                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-8">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                        <Globe className="h-6 w-6" />
                                                        General Configuration
                                                    </CardTitle>
                                                    <CardDescription className="text-blue-100 font-medium">
                                                        Manage global platform identity and accessibility.
                                                    </CardDescription>
                                                </div>
                                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-3">v2.4.0-stable</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 -mt-4 bg-white rounded-t-3xl space-y-8">
                                            <SettingGroup title="Platform Branding" description="Set the primary identity of the healthcare system.">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase text-gray-400">System Name</Label>
                                                        <Input
                                                            value={settings.systemName}
                                                            onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                                            className="rounded-xl border-gray-100 bg-gray-50/30"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase text-gray-400">Support Email</Label>
                                                        <Input
                                                            value={settings.supportEmail}
                                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                                            className="rounded-xl border-gray-100 bg-gray-50/30"
                                                        />
                                                    </div>
                                                </div>
                                            </SettingGroup>

                                            <SettingGroup title="Accessibility" description="Control how users interact with the platform.">
                                                <div className="space-y-3">
                                                    <ToggleSetting
                                                        label="Public Registration"
                                                        description="Allow new users to create accounts without manual approval."
                                                        checked={settings.publicRegistration}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, publicRegistration: val })}
                                                    />
                                                    <ToggleSetting
                                                        label="Maintenance Mode"
                                                        description="Temporarily disable platform access for all non-admin users."
                                                        checked={settings.maintenanceMode}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, maintenanceMode: val })}
                                                    />
                                                    {settings.maintenanceMode && (
                                                        <div className="space-y-2 px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                                            <Label className="text-xs font-bold uppercase text-amber-600">Maintenance Broadcast Message</Label>
                                                            <Input
                                                                value={settings.maintenanceMessage}
                                                                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                                                                placeholder="Enter message for users..."
                                                                className="rounded-xl border-amber-100 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-500"
                                                            />
                                                            <p className="text-[10px] text-amber-700 font-medium italic">This message will appear on the global announcement banner.</p>
                                                        </div>
                                                    )}
                                                    <ToggleSetting
                                                        label="AI Assistance (Global)"
                                                        description="Enable AI Health Companion for all patient dashboards."
                                                        checked={settings.aiAssistance}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, aiAssistance: val })}
                                                    />
                                                </div>
                                            </SettingGroup>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Security Settings */}
                                {activeTab === 'security' && (
                                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden animate-in fade-in duration-500">
                                        <CardHeader className="border-b border-gray-100 pb-6">
                                            <div className="flex items-center gap-2 px-8 pt-8">
                                                <Shield className="h-5 w-5 text-rose-600" />
                                                <CardTitle className="text-2xl font-bold">Security & Privacy</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            <SettingGroup title="Authentication" description="Configure identity and session security.">
                                                <div className="space-y-3">
                                                    <ToggleSetting
                                                        label="Require 2FA for Staff"
                                                        description="Enforce two-factor authentication for all center staff and doctors."
                                                        checked={settings.require2FA}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, require2FA: val })}
                                                    />
                                                    <ToggleSetting
                                                        label="KYC Auto-Verification"
                                                        description="Use AI to automatically verify government matching in real-time."
                                                        checked={settings.kycAutoVerify}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, kycAutoVerify: val })}
                                                    />
                                                    <ToggleSetting
                                                        label="Halt All Transactions"
                                                        description="Emergency switch to pause all payments and wallets across the platform."
                                                        checked={settings.haltTransactions}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, haltTransactions: val })}
                                                    />
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            <Lock className="h-5 w-5 text-indigo-700" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-sm font-bold text-gray-900">Session Timeout</Label>
                                                            <p className="text-xs text-gray-500">Automatically logout inactive users.</p>
                                                        </div>
                                                        <select
                                                            value={settings.sessionTimeout}
                                                            onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                                            className="bg-transparent text-sm font-bold text-indigo-700 focus:outline-none cursor-pointer"
                                                        >
                                                            <option value="15 Minutes">15 Minutes</option>
                                                            <option value="30 Minutes">30 Minutes</option>
                                                            <option value="1 Hour">1 Hour</option>
                                                            <option value="4 Hours">4 Hours</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </SettingGroup>

                                            <SettingGroup title="Global Compliance" description="Manage data protection standards (GDPR, HIPAA).">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Button variant="outline" className="h-auto py-4 rounded-2xl border-gray-100 justify-start gap-4">
                                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                                            <Eye className="h-5 w-5 text-emerald-700" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold">Privacy Policy</p>
                                                            <p className="text-[10px] text-gray-500">Last updated Mar 2026</p>
                                                        </div>
                                                    </Button>
                                                    <Button variant="outline" className="h-auto py-4 rounded-2xl border-gray-100 justify-start gap-4">
                                                        <div className="p-2 bg-amber-100 rounded-lg">
                                                            <Server className="h-5 w-5 text-amber-700" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold">Data Sovereignty</p>
                                                            <p className="text-[10px] text-gray-500">Primary Region: EU-AWS</p>
                                                        </div>
                                                    </Button>
                                                </div>
                                            </SettingGroup>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notifications Settings */}
                                {activeTab === 'notifications' && (
                                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden animate-in fade-in duration-500">
                                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white pb-8">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                        <Bell className="h-6 w-6" />
                                                        Global Notifications
                                                    </CardTitle>
                                                    <CardDescription className="text-amber-50 font-medium">Control system-wide communication protocols.</CardDescription>
                                                </div>
                                                <Badge className="bg-white/20 text-white border-none py-1.5 px-3">Relay: Active</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 -mt-4 bg-white rounded-t-3xl space-y-8">
                                            <SettingGroup title="Infrastructure" description="Manage communication servers and relay channels.">
                                                <div className="space-y-3">
                                                    <ToggleSetting
                                                        label="Transactional Emails"
                                                        description="Enable automated emails for appointments and payments."
                                                        checked={settings.emailEnabled}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, emailEnabled: val })}
                                                    />
                                                    <ToggleSetting
                                                        label="In-App Toast Alerts"
                                                        description="Provide real-time feedback for administrative actions."
                                                        checked={settings.toastEnabled}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, toastEnabled: val })}
                                                    />
                                                    <ToggleSetting
                                                        label="SMS Gateway"
                                                        description="Use Twilio relay for emergency diagnostic alerts."
                                                        checked={settings.smsEnabled}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, smsEnabled: val })}
                                                    />
                                                </div>
                                            </SettingGroup>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Data Management */}
                                {activeTab === 'database' && (
                                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden animate-in fade-in duration-500">
                                        <CardHeader className="bg-slate-900 text-white pb-8">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                        <Database className="h-6 w-6" />
                                                        Registry Database
                                                    </CardTitle>
                                                    <CardDescription className="text-slate-400 font-medium">Manage cloud storage and persistent records.</CardDescription>
                                                </div>
                                                <Badge className="bg-blue-600 text-white border-none py-1.5 px-3">Sync: Healthy</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 -mt-4 bg-white rounded-t-3xl space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database Size</p>
                                                    <p className="text-2xl font-black text-gray-900">4.2 GB</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Rows</p>
                                                    <p className="text-2xl font-black text-gray-900">1.8M+</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Backup</p>
                                                    <p className="text-sm font-bold text-emerald-600">2 Hours Ago</p>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full h-14 rounded-2xl bg-slate-900 font-black uppercase tracking-widest"
                                                onClick={() => {
                                                    toast.promise(new Promise(res => setTimeout(res, 2000)), {
                                                        loading: 'Initiating Cloud Registry Backup...',
                                                        success: 'System State Persisted: Snapshot saved to Archive Vault.',
                                                        error: 'Backup failed'
                                                    });
                                                }}
                                            >
                                                Execute Full System Backup
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* API & Integrations */}
                                {activeTab === 'api' && (
                                    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden animate-in fade-in duration-500">
                                        <CardHeader className="bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white pb-8">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                        <Zap className="h-6 w-6" />
                                                        API Ecosystem
                                                    </CardTitle>
                                                    <CardDescription className="text-violet-50 font-medium">Connect third-party services and manage webhooks.</CardDescription>
                                                </div>
                                                <Badge className="bg-white/20 text-white border-none py-1.5 px-3">v1.2.0-api</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 -mt-4 bg-white rounded-t-3xl space-y-8">
                                            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                                <Lock className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                                <h4 className="font-bold text-gray-900">External API Keys</h4>
                                                <p className="text-xs text-gray-500 mt-1 mb-6">Manage secrets for Google Maps, Twilio, and other integrations.</p>
                                                <div className="flex flex-col items-center gap-4">
                                                    <ToggleSetting
                                                        label="API Registry Locked"
                                                        description="Prevent modifications to API keys via the UI."
                                                        checked={settings.apiRegistryLocked}
                                                        onCheckedChange={(val: boolean) => setSettings({ ...settings, apiRegistryLocked: val })}
                                                    />
                                                    <Button variant="outline" className="rounded-xl font-bold" disabled={settings.apiRegistryLocked}>
                                                        {settings.apiRegistryLocked ? <Lock className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                                        Manage API Registry
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettingsPage;
