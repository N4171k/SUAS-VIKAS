import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Must be a unique reverse-domain identifier
  appId: 'com.vikas.shopping',
  appName: 'VIKAS',
  // Points to the Next.js static export output folder
  webDir: 'out',

  server: {
    // On Android emulator, 10.0.2.2 maps to host machine localhost.
    // For a physical device, replace with your LAN IP, e.g. http://192.168.1.x:5000
    // Set LIVE_RELOAD=true for development to enable live reload from the dev server.
    androidScheme: 'https',
  },

  android: {
    allowMixedContent: true, // allow HTTP API calls from HTTPS webview
    captureInput: true,
    webContentsDebuggingEnabled: true, // enable Chrome DevTools for debug builds
  },

  plugins: {
    CapacitorHttp: {
      enabled: true, // use native HTTP to bypass CORS on device
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f0f0f',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#FF385C',
    },
  },
};

export default config;
