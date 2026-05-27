import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export interface SocialProfile {
  provider: 'google';
  providerId: string;
  email: string;
  displayName: string;
}

export function configureGoogleStrategy(callbackBaseUrl: string): void {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return;
  }

  passport.use(new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: `${callbackBaseUrl}/api/v1/auth/google/callback`,
    },
    (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(null, false, { message: 'email-required' });
      }
      const socialProfile: SocialProfile = {
        provider: 'google',
        providerId: profile.id,
        email,
        displayName: profile.displayName || email.split('@')[0],
      };
      done(null, socialProfile as any);
    },
  ));
}
