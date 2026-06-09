import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familylink.app',
  appName: 'FamilyLink',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://family-link-rosy.vercel.app',
    cleartext: false,
  },
  plugins: {
    Geolocation: {},
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