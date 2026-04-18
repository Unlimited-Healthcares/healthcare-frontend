import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Home, CreditCard } from 'lucide-react';
import { integrationsService } from '@/services/integrationsService';

const PaymentCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            const statusParam = searchParams.get('status');
            const cancelledParam = searchParams.get('cancelled');

            // Check for explicit cancellation signals from gateways
            if (statusParam === 'cancelled' || cancelledParam === 'true') {
                setStatus('failed');
                setMessage('Payment was cancelled. You have not been charged.');
                return;
            }

            const reference = searchParams.get('reference') || searchParams.get('tx_ref') || searchParams.get('payment_id');
            const trxref = searchParams.get('trxref');

            try {
                const finalReference = reference || trxref || searchParams.get('tx_ref');

                if (!finalReference) {
                    // If no reference and not explicitly cancelled, it might be a direct navigation or a weird return
                    setStatus('failed');
                    setMessage('No payment reference found. If you cancelled the transaction, you can try again.');
                    return;
                }

                const result = await integrationsService.getPaymentStatus(finalReference);

                if (result.status === 'succeeded') {
                    setStatus('success');
                    setMessage('Payment processed successfully. Your subscription has been updated.');
                } else if (result.status === 'cancelled') {
                    setStatus('failed');
                    setMessage('Payment was cancelled at the gateway.');
                } else {
                    setStatus('failed');
                    setMessage(result.errorMessage || 'Payment was not successful');
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('failed');
                setMessage(error.message || 'Could not verify your payment status. If funds were deducted, please contact our support team.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <CardHeader className="text-center pt-8">
                    <div className="flex justify-center mb-6">
                        {status === 'loading' && (
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-in zoom-in duration-500">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                        )}
                        {status === 'failed' && (
                            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center animate-in zoom-in duration-500">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
                        {status === 'loading' && 'Processing Payment'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'failed' && 'Oops! Something went wrong'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-2">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8 space-y-4">
                    {status !== 'loading' && (
                        <>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="w-full h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                            <Button
                                onClick={() => navigate('/pricing')}
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold border-slate-200"
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Review Plans
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCallback;
