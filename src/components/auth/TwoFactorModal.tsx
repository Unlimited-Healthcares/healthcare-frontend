import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorModalProps {
    onVerify: (code: string) => Promise<void>;
    onCancel: () => void;
    email: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ onVerify, onCancel, email }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        try {
            setLoading(true);
            await onVerify(code);
        } catch (err: any) {
            toast.error(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (timer > 0) return;
        setTimer(60);
        toast.success('A new code has been sent to your device');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md shadow-inner border border-white/30">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight mb-2">Security Verification</CardTitle>
                    <CardDescription className="text-blue-100 font-medium">
                        Two-Factor Authentication is enabled on your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <Smartphone className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
                            <p className="text-sm font-semibold text-blue-900 leading-relaxed">
                                Enter the 6-digit code sent to your registered device for <span className="font-black underline">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full space-y-6">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full h-16 text-center text-4xl font-black tracking-[0.75rem] bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-blue-900 placeholder:text-gray-200"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                        VERIFYING...
                                    </>
                                ) : (
                                    'VERIFY & SIGN IN'
                                )}
                            </Button>
                        </form>

                        <div className="flex flex-col items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0}
                                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                <RefreshCw className={`w-4 h-4 ${timer > 0 ? '' : 'animate-spin-slow'}`} />
                                {timer > 0 ? `RESEND CODE IN ${timer}S` : 'RESEND VERIFICATION CODE'}
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="text-sm font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest underline underline-offset-4"
                            >
                                CANCEL & GO BACK
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
