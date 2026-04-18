import React, { useEffect, useRef, useState } from 'react';
import { hideNativeSplash } from '@/services/capacitor';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'pulse' | 'exit'>('enter');
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [version, setVersion] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Hide native Capacitor splash screen as soon as JS splash mounts
    hideNativeSplash();

    const checkAndSync = async () => {
      try {
        const { bundle } = await CapacitorUpdater.current();
        setVersion(bundle.version || '1.0.0');

        // Check for updates
        const result = await CapacitorUpdater.getLatest();
        const lastSyncedVersion = localStorage.getItem('uhc_last_synced_version');

        if (
          result.version &&
          result.url &&
          (bundle.version || 'builtin') !== result.version &&
          lastSyncedVersion !== result.version
        ) {
          setSyncing(true);
          const download = await CapacitorUpdater.download({
            version: result.version,
            url: result.url,
          });

          localStorage.setItem('uhc_last_synced_version', result.version);

          // Apply immediately and restart
          setTimeout(async () => {
            await CapacitorUpdater.set({ id: download.id });
          }, 500);
          return; // Exit, app will reload
        }
      } catch (e) {
        console.error('OTA Error:', e);
      }

      // If no update or error, proceed to app
      timerRef.current = setTimeout(() => setPhase('pulse'), 600);
      setTimeout(() => setPhase('exit'), 2400);
      setTimeout(() => onComplete(), 3000);
    };

    checkAndSync();
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        overflow: 'hidden',
        transition: phase === 'exit' ? 'opacity 0.6s ease' : 'none',
        opacity: phase === 'exit' ? 0 : 1,
      }}
    >
      {/* Background glow orbs */}
      <div style={glowOrb('#3b82f6', { top: '-120px', right: '-80px' })} />
      <div style={glowOrb('#0ea5e9', { bottom: '-140px', left: '-100px' })} />
      <div style={glowOrb('#6366f1', { top: '40%', left: '-60px', width: 200, height: 200 })} />

      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          transform: phase === 'enter' ? 'scale(0.8) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease',
        }}
      >
        {/* Logo container */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Ripple rings */}
          <div style={ripple(phase === 'pulse', '140px', '0s')} />
          <div style={ripple(phase === 'pulse', '110px', '0.4s')} />

          {/* Logo badge */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              boxShadow: '0 0 40px rgba(59,130,246,0.5), 0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <img
              src="/images/logo/logo-new.png"
              alt="UHC"
              style={{ width: 58, height: 58, objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Fallback icon if logo fails */}
            <svg
              style={{ position: 'absolute', opacity: 0 }}
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Shine overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
              }}
            />
          </div>
        </div>

        {/* Text block */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: 4,
              margin: 0,
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              textShadow: '0 2px 20px rgba(59,130,246,0.4)',
            }}
          >
            UHC
          </h1>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              margin: '8px 0 0',
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            Unlimited Healthcare
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'opacity 0.8s ease 0.4s',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            width: '38%',
            maxWidth: 200,
            height: 3,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            ref={progressRef}
            style={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)',
              width: phase === 'enter' ? '0%' : '100%',
              transition: phase === 'enter' ? 'none' : 'width 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: syncing ? '#3b82f6' : '#475569',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: 0,
            fontFamily: "'Inter', -apple-system, sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          {syncing && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          )}
          {syncing ? `Syncing Update...` : `v${version} · Secure Access`}
        </p>
      </div>

      <style>{`
        @keyframes ripple-splash {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.28; }
        }
      `}</style>
    </div>
  );
};

// ── helpers ──────────────────────────────────────────────────────────────────
function glowOrb(
  color: string,
  pos: React.CSSProperties,
  w = 280,
  h = 280
): React.CSSProperties {
  return {
    position: 'absolute',
    width: w,
    height: h,
    borderRadius: '50%',
    background: color,
    filter: 'blur(80px)',
    opacity: 0.2,
    animation: 'glow-pulse 3s ease-in-out infinite',
    pointerEvents: 'none',
    ...pos,
  };
}

function ripple(active: boolean, size: string, delay: string): React.CSSProperties {
  return {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    border: '1.5px solid rgba(59,130,246,0.35)',
    animation: active ? `ripple-splash 2.4s ease-in-out ${delay} infinite` : 'none',
    pointerEvents: 'none',
  };
}

export default SplashScreen;
