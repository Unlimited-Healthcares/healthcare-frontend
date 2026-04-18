import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const initCapacitor = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }


  // Style Status Bar - dark to match splash
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch (err) {
    console.warn('StatusBar not available', err);
  }
};

/**
 * Call this once your JS splash screen has started rendering.
 * Hides the native splash with a smooth fade so the transition is seamless.
 */
export const hideNativeSplash = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.warn('SplashScreen.hide failed', err);
  }
};
