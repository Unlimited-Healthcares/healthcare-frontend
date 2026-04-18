import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import VerifyChoice from "@/components/auth/VerifyChoice";
import VerifyAccount from "@/components/auth/VerifyAccount";
import { User, FileText, MessageCircle, Heart } from "lucide-react";

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify' | 'verify-choice' | 'verify-request';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, resendVerification } = useAuth();

  // Parse query params for reset token
  const queryParams = new URLSearchParams(location.search);
  const resetToken = queryParams.get('token');
  const tab = queryParams.get('tab');
  const email = queryParams.get('email') || '';

  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    if (tab === 'verify') return 'verify';
    if (resetToken || tab === 'reset') return 'reset-password';
    if (location.pathname === "/auth/register") return 'register';
    if (tab === 'verify-choice') return 'verify-choice';
    return 'login';
  });
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');

  // Get the return path from location state or sessionStorage
  const fromLocation = location.state?.from;
  const storedPath = sessionStorage.getItem('returnPath');
  const from = fromLocation || storedPath || "/dashboard";

  // Watch for path changes or token changes to update authMode
  useEffect(() => {
    if (tab === 'verify') {
      setAuthMode('verify');
    } else if (resetToken || tab === 'reset') {
      setAuthMode('reset-password');
    } else if (location.pathname === "/auth/register") {
      setAuthMode('register');
    } else if (location.pathname === "/auth/login" || location.pathname === "/auth") {
      setAuthMode('login');
    }
  }, [location.pathname, resetToken, tab]);

  // Store the return path in sessionStorage for persistence across refreshes
  useEffect(() => {
    if (fromLocation && fromLocation !== '/auth/login') {
      sessionStorage.setItem('returnPath', fromLocation);
    }
  }, [fromLocation]);

  // Redirect authenticated users away from auth pages, EXCEPT for verification and reset-password modes
  useEffect(() => {
    if (isAuthenticated && !loading &&
      authMode !== 'verify' &&
      authMode !== 'verify-choice' &&
      authMode !== 'verify-request' &&
      authMode !== 'reset-password') {
      // Clear the stored return path after successful navigation
      sessionStorage.removeItem('returnPath');
      navigate(from);
    }
  }, [isAuthenticated, loading, navigate, from, authMode]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-600"></div>
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    switch (authMode) {
      case 'register':
        return <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBackToLogin={() => setAuthMode('login')} />;
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken || ''}
            onBackToLogin={() => {
              setAuthMode('login');
              navigate('/auth', { replace: true });
            }}
          />
        );
      case 'verify-choice':
        return (
          <VerifyChoice
            email={email}
            onChoiceMade={(channel) => {
              setSelectedChannel(channel);
              setAuthMode('verify');
            }}
            onBackToLogin={() => {
              setAuthMode('login');
              navigate('/auth', { replace: true });
            }}
          />
        );
      case 'verify':
        return (
          <VerifyAccount
            email={email}
            channel={selectedChannel}
            initialCode={resetToken || ''}
            onBackToLogin={() => {
              setAuthMode('login');
              navigate('/auth', { replace: true });
            }}
            onChangeMethod={() => setAuthMode('verify-choice')}
          />
        );
      case 'verify-request':
        return (
          <div className="w-full max-w-md mx-auto py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">Request Verification</h2>
              <p className="text-gray-500 font-medium italic">Enter your email to receive a new verification code.</p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const mail = (e.target as any).email.value;
              if (mail) {
                try {
                  // Actually trigger the verification email
                  await resendVerification(mail, 'email');
                  // Navigate directly to code entry screen
                  navigate(`/auth?tab=verify&email=${encodeURIComponent(mail)}`);
                } catch (error) {
                  // resendVerification already shows toast error
                }
              }
            }} className="space-y-6">
              <div>
                <label htmlFor="email-request" className="form-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  id="email-request"
                  className="input-field"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">Continue</button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest pt-4"
              >
                Back to Login
              </button>
            </form>
          </div>
        );
      case 'login':
      default:
        return (
          <LoginForm
            onSwitchToRegister={(verify) => setAuthMode(verify ? 'verify-request' : 'register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:hidden mb-8 text-center pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 group transition-transform hover:scale-105 duration-300">
              <img src="/images/logo/logo-new.png" alt="UHC Logo" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Unlimited Healthcare</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium italic">Connect. Coordinate. Care.</p>
          </div>
          {renderForm()}
        </div>
      </div>

      {/* Visual Feature Side */}
      <div className="relative hidden lg:flex lg:w-3/5 overflow-hidden">
        {/* Background Image with Parallax-like effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-105"
          style={{ backgroundImage: "url('/images/auth/background.png')" }}
        />

        {/* Complex Gradient Overlay for Premium Look */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/95 via-blue-800/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-950/80" />

        {/* Content Container with Glassmorphism */}
        <div className="relative flex flex-col justify-between h-full p-16 z-20">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group hover:bg-white/20 transition-all duration-300">
                <img src="/images/logo/logo-new.png" alt="UHC Logo" className="h-8 w-8 object-contain brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter shadow-sm">UHC</h1>
                <p className="text-blue-200/90 text-sm font-bold uppercase tracking-widest letter-spacing-1 mt-1">Unlimited Healthcare</p>
              </div>
            </div>
          </div>

          <div className="max-w-xl space-y-12 mb-12 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div>
              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                The Future of <span className="text-blue-400">Care</span> Starts Here.
              </h2>
              <p className="mt-6 text-xl text-blue-100 font-medium leading-relaxed opacity-90 border-l-4 border-blue-400 pl-6 backdrop-blur-sm py-2">
                "Connecting doctors, facilities, and patients in a seamless ecosystem designed for excellence."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              {[
                { icon: User, title: "Digital IDs", desc: "Unified secure identification" },
                { icon: FileText, title: "Reports", desc: "Real-time record sharing" },
                { icon: MessageCircle, title: "Chat", desc: "Secure instant communication" },
                { icon: Heart, title: "Quality", desc: "Curated healthcare network" }
              ].map((feature, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/40 transition-colors">
                    <feature.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-blue-100/70 mt-1 leading-snug">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-blue-200/60 text-xs font-bold tracking-widest uppercase animate-in fade-in duration-1000 delay-500">
            <span>&copy; {new Date().getFullYear()} UHC PLATFORM</span>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Trust</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
