import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VerifyChoiceProps {
  email: string;
  onChoiceMade: (channel: 'email' | 'sms' | 'whatsapp') => void;
  onBackToLogin: () => void;
}

const VerifyChoice: React.FC<VerifyChoiceProps> = ({ email, onChoiceMade, onBackToLogin }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { resendVerification } = useAuth();

  const handleChoice = async (channel: 'email' | 'sms' | 'whatsapp') => {
    setLoading(channel);
    try {
      await resendVerification(email, channel);
      onChoiceMade(channel);
    } catch (error) {
      // Error is already handled by toast in useAuth
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">Verify Your Account</h2>
        <p className="text-gray-500 font-medium italic">Choose how you'd like to receive your verification code.</p>
      </div>

      <div className="space-y-4">
        {/* Email Option */}
        <button
          onClick={() => handleChoice('email')}
          disabled={!!loading}
          className="w-full group relative flex items-center p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 opacity-50" />
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors z-10 font-bold">
            {loading === 'email' ? (
              <Loader2 className="animate-spin text-blue-600" size={24} />
            ) : (
              <Mail className="text-blue-600" size={24} />
            )}
          </div>
          <div className="text-left z-10">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Email Address</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{email}</p>
          </div>
        </button>

        {/* SMS Option */}
        <button
          onClick={() => handleChoice('sms')}
          disabled={!!loading}
          className="w-full group relative flex items-center p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 opacity-50" />
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors z-10 font-bold">
             {loading === 'sms' ? (
              <Loader2 className="animate-spin text-blue-600" size={24} />
            ) : (
              <MessageSquare className="text-blue-600" size={24} />
            )}
          </div>
          <div className="text-left z-10">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">SMS Message</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fast text message delivery</p>
          </div>
        </button>

        {/* WhatsApp Option */}
        <button
          onClick={() => handleChoice('whatsapp')}
          disabled={!!loading}
          className="w-full group relative flex items-center p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500 opacity-50" />
          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors z-10 font-bold">
            {loading === 'whatsapp' ? (
              <Loader2 className="animate-spin text-green-600" size={24} />
            ) : (
              <Phone className="text-green-600" size={24} />
            )}
          </div>
          <div className="text-left z-10">
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">WhatsApp</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Secure official channel</p>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center pt-6 border-t border-gray-50">
        <button 
          onClick={onBackToLogin}
          className="inline-flex items-center text-gray-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyChoice;
