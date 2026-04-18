import React, { useState, useRef, useCallback, useEffect } from 'react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  gradient: [string, string, string];
  accent: string;
  iconBg: string;
  icon: React.ReactNode;
  imageSrc: string;
  tag: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    title: 'Your Health,',
    subtitle: 'All in One Place',
    description:
      'Store medical records, prescriptions, and lab results securely — accessible from anywhere, at any time.',
    gradient: ['#0f1f3d', '#1a3560', '#0d2347'],
    accent: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.15)',
    tag: 'RECORDS',
    imageSrc: '/images/doctor-patient.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>
    ),
  },
  {
    id: 1,
    title: 'See a Doctor',
    subtitle: 'From Anywhere',
    description:
      'Connect with verified specialists via HD video consultations. No waiting rooms, no commute.',
    gradient: ['#1c0f3d', '#2d1a60', '#180d47'],
    accent: '#8b5cf6',
    iconBg: 'rgba(139,92,246,0.15)',
    tag: 'TELEHEALTH',
    imageSrc: '/images/vaccination.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8z" />
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Emergency',
    subtitle: 'Response Ready',
    description:
      'One tap SOS, ambulance dispatch, and emergency contact alerts — help arrives faster when it matters most.',
    gradient: ['#3d0f0f', '#5c1a1a', '#470d0d'],
    accent: '#ef4444',
    iconBg: 'rgba(239,68,68,0.15)',
    tag: 'EMERGENCY',
    imageSrc: '/images/physical-exam.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Community',
    subtitle: 'Healthcare Network',
    description:
      'Join thousands of patients and providers in a coordinated, seamless care ecosystem built just for you.',
    gradient: ['#0f3d1f', '#1a6030', '#0d4720'],
    accent: '#10b981',
    iconBg: 'rgba(16,185,129,0.15)',
    tag: 'COMMUNITY',
    imageSrc: '/images/patient-care.png',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [slideEnterDir, setSlideEnterDir] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current || index < 0 || index >= SLIDES.length) return;
      setIsAnimating(true);
      setSlideEnterDir(index > current ? 'left' : 'right');
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [current, isAnimating]
  );

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      goTo(current + 1);
    }
  };

  const handleSkip = () => onComplete();

  // Touch / mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    setDragStart(e.clientX);
    setDragDelta(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart === null) return;
    setDragDelta(e.clientX - dragStart);
  };
  const onPointerUp = () => {
    if (dragStart === null) return;
    if (Math.abs(dragDelta) > 60) {
      if (dragDelta < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    setDragStart(null);
    setDragDelta(0);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        overflow: 'hidden',
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        background: `linear-gradient(160deg, ${slide.gradient[0]} 0%, ${slide.gradient[1]} 50%, ${slide.gradient[2]} 100%)`,
        transition: 'background 0.6s ease',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Background decorations */}
      <BackgroundDecor accent={slide.accent} />

      {/* Skip */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 56,
          right: 24,
          zIndex: 10,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          padding: '8px 18px',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        Skip
      </button>

      {/* Slide content */}
      <div
        key={current}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          animation: slideEnterDir ? `slideIn${slideEnterDir === 'left' ? 'FromRight' : 'FromLeft'} 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) forwards` : 'none',
        }}
      >
        {/* Image area */}
        <div
          style={{
            flex: '0 0 52%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={slide.imageSrc}
            alt={slide.title}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              opacity: 0.55,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          {/* Gradient overlay bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, transparent 30%, ${slide.gradient[0]} 100%)`,
            }}
          />

          {/* Tag pill */}
          <div
            style={{
              position: 'absolute',
              top: 56,
              left: 28,
              background: slide.iconBg,
              border: `1px solid ${slide.accent}40`,
              borderRadius: 20,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: slide.accent,
                boxShadow: `0 0 8px ${slide.accent}`,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: slide.accent,
                letterSpacing: '0.14em',
              }}
            >
              {slide.tag}
            </span>
          </div>

          {/* Icon badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 28,
              width: 68,
              height: 68,
              borderRadius: 22,
              background: 'rgba(10,10,20,0.7)',
              border: `1.5px solid ${slide.accent}40`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 20px ${slide.accent}20`,
            }}
          >
            {slide.icon}
          </div>

          {/* Slide counter */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              right: 28,
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </div>
        </div>

        {/* Text area */}
        <div
          style={{
            flex: 1,
            padding: '32px 32px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {slide.title}
            </h2>
            <h2
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: slide.accent,
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {slide.subtitle}
            </h2>
          </div>

          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              margin: 0,
              fontWeight: 450,
            }}
          >
            {slide.description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 32px 48px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? slide.accent : 'rgba(255,255,255,0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.35s ease, background 0.35s ease',
                boxShadow: i === current ? `0 0 10px ${slide.accent}80` : 'none',
              }}
            />
          ))}
        </div>

        {/* Next / Get Started */}
        <button
          onClick={handleNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: slide.accent,
            border: 'none',
            borderRadius: 22,
            padding: isLast ? '0 28px' : '0 22px',
            height: 52,
            cursor: 'pointer',
            boxShadow: `0 8px 28px ${slide.accent}55`,
            transition: 'background 0.35s ease, box-shadow 0.35s ease, padding 0.25s ease',
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </span>
          {/* Arrow icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');

        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// ── Background decorations ────────────────────────────────────────────────────
const BackgroundDecor: React.FC<{ accent: string }> = ({ accent }) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: -100,
        right: -80,
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: accent,
        filter: 'blur(100px)',
        opacity: 0.12,
        pointerEvents: 'none',
        transition: 'background 0.6s ease',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: -100,
        left: -80,
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: accent,
        filter: 'blur(90px)',
        opacity: 0.1,
        pointerEvents: 'none',
        transition: 'background 0.6s ease',
      }}
    />
    {/* Subtle grid */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        pointerEvents: 'none',
      }}
    />
  </>
);

export default OnboardingScreen;
