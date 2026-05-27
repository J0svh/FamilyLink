import { Router } from 'express';
import passport from 'passport';
import { SocialLoginUseCase } from '../../../application/use-cases/auth/SocialLoginUseCase';
import { SocialProfile } from '../../auth/passportGoogle';

export function createSocialAuthRoutes(socialLoginUseCase: SocialLoginUseCase): Router {
  const router = Router();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Google OAuth initiation
  router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
  }));

  // Google OAuth callback
  router.get('/google/callback',
    (req, res, next) => {
      passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login?error=auth-failed` },
        async (err: any, profile: SocialProfile | false, info: any) => {
          if (err || !profile) {
            const errorCode = info?.message || 'auth-failed';
            return res.redirect(`${frontendUrl}/login?error=${errorCode}`);
          }

          try {
            const result = await socialLoginUseCase.execute(profile);

            const params = new URLSearchParams({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
              userId: result.userId,
              email: result.email,
              username: result.username || '',
              status: result.needsUsername ? 'needs-username' : 'success',
            });

            return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
          } catch (error) {
            console.error('Social login error:', error);
            return res.redirect(`${frontendUrl}/login?error=server-error`);
          }
        },
      )(req, res, next);
    },
  );

  return router;
}
