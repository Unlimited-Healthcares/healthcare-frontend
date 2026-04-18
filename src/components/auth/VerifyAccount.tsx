import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';

interface VerifyAccountProps {
  email: string;
  channel?: 'email' | 'sms' | 'whatsapp';
  initialCode?: string;
  onBackToLogin: () => void;
  onChangeMethod?: () => void;
}

const VerifyAccount: React.FC<VerifyAccountProps> = ({ 
  email, 
  channel = 'email', 
  initialCode = '', 
  onBackToLogin,
  onChangeMethod
}) => {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyAccount, resendVerification } = useAuth();

  // Prevent the auto-submit effect from firing more than once for the same
  // initialCode (guards against React StrictMode double-invocation and
  // rapid re-renders with the same value).
  const autoSubmittedCodeRef = useRef<string>('');

  const handleVerify = async (e?: React.FormEvent, verificationCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = (verificationCode || code).trim();
    if (!codeToVerify) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await verifyAccount(codeToVerify);
      setSuccess(true);
    } catch (err: any) {
      const msg: string = err?.message || 'Verification failed.';
      // Friendly hint when token is stale so user knows to request a new one
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setError('That code is invalid or has expired. Please request a new one using "Resend code".');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when a code arrives via URL (email link click).
  // The ref guard ensures we fire at most once per unique code value.
  React.useEffect(() => {
    if (initialCode && initialCode.length >= 6 && autoSubmittedCodeRef.current !== initialCode) {
      autoSubmittedCodeRef.current = initialCode;
      handleVerify(undefined, initialCode);
    }
  }, [initialCode]);

  const handleResend = async () => {
    if (!email) {
      setError('Missing email address. Please go back and register again.');
      return;
    }

    setResending(true);
    setError(null);
    setResent(false);
    // Reset so the new code can auto-submit if clicked from email again
    autoSubmittedCodeRef.current = '';
    try {
      await resendVerification(email, channel);
      setResent(true);
      setCode('');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center py-12">
      <ShieldCheck className="mx-auto text-primary-600 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-2 uppercase tracking-tight">Code Sent!</h2>
      <p className="text-gray-600 mb-8 max-w-xs mx-auto">
        Please enter the verification code we sent to your <span className="font-bold text-gray-900 uppercase">{channel}</span>.
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="input-field w-full text-center"
          placeholder="Verification code"
          required
        />
        {error && <div className="text-error-600 mb-2 font-medium">{error}</div>}
        {success && <div className="text-green-600 mb-2 font-bold uppercase tracking-wide">Account verified! Redirecting...</div>}
        {resent && <div className="text-blue-600 mb-2 font-bold uppercase tracking-wide">Verification code resent via {channel}!</div>}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />Verifying...</> : 'Verify Account'}
        </button>
        <button
          type="button"
          className="btn-secondary w-full flex items-center justify-center font-bold"
          onClick={handleResend}
          disabled={resending}
        >
          {resending
            ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />Resending...</>
            : <><RefreshCcw className="h-4 w-4 mr-2" />Resend Code ({channel})</>}
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {onChangeMethod && (
          <button
            className="w-full text-blue-600 hover:text-blue-700 font-bold text-xs uppercase tracking-widest transition-colors block"
            onClick={onChangeMethod}
          >
            Use a different method
          </button>
        )}
        <button
          className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest transition-colors block"
          onClick={onBackToLogin}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyAccount;
