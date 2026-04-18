import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MailCheck, RefreshCcw, ShieldCheck } from 'lucide-react';
import VerifyAccount from './VerifyAccount';

interface CheckEmailProps {
  email: string;
  onBackToLogin: () => void;
}

const CheckEmail: React.FC<CheckEmailProps> = ({ email, onBackToLogin }) => {
  const { resendVerification, loading } = useAuth();
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState(false);

  const handleResend = async () => {
    setError(null);
    setResent(false);
    try {
      await resendVerification(email, 'email');
      setResent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email.');
    }
  };

  if (showVerify) {
    return <VerifyAccount email={email} onBackToLogin={onBackToLogin} />;
  }
  return (
    <div className="w-full max-w-md mx-auto text-center py-12">
      <MailCheck className="mx-auto text-primary-600 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-2">Check your email</h2>
      <p className="text-gray-700 mb-6">
        We've sent a verification link to <span className="font-medium">{email}</span>.<br />
        Please check your inbox and follow the instructions to verify your account.
      </p>
      {resent && (
        <div className="text-green-600 mb-4">Verification email resent!</div>
      )}
      {error && (
        <div className="text-error-600 mb-4">{error}</div>
      )}
      <button
        className="btn-secondary w-full flex items-center justify-center mb-4"
        onClick={handleResend}
        disabled={loading}
      >
        {loading ? (
          <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />Resending...</>
        ) : (
          <><RefreshCcw className="h-4 w-4 mr-2" />Resend verification email</>
        )}
      </button>
      <button
        className="btn-secondary w-full flex items-center justify-center mb-4"
        onClick={() => setShowVerify(true)}
      >
        <ShieldCheck className="h-4 w-4 mr-2" /> Enter verification code
      </button>
      <button
        className="btn-link text-primary-600 hover:text-primary-700"
        onClick={onBackToLogin}
      >
        Back to Login
      </button>
    </div>
  );
};

export default CheckEmail;
