import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familylink.app',
  appName: 'FamilyLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Use the deployed URL so the app works without a local server
    url: 'https://family-link-rosy.vercel.app',
    cleartext: false,
  },
  plugins: {
    Geolocation: {
      // Request precise location
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0c29',
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0f0c29',
  },
};

export default config;
