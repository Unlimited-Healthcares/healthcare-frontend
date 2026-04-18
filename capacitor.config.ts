import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.unlimitedhealthcares.app',
  appName: 'Unlimited Healthcares',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'healthcare-backend-vih6.onrender.com'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 3000,      // safety net max duration (ms)
      launchAutoHide: false,         // we call SplashScreen.hide() ourselves
      backgroundColor: '#0f172a',   // dark background matches JS splash
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    CapacitorUpdater: {
      updateUrl: 'https://healthcare-backend-vih6.onrender.com/api/ota/check',
      autoUpdate: true,
      statsUrl: '',
    },
  },
};

export default config;
