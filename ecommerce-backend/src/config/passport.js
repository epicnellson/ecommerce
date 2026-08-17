import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';

const initializePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email provided by Google'), null);
            }

            let user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
              // Link Google to existing account if not already linked
              if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
              }
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              name: profile.displayName || 'Google User',
              email: email.toLowerCase(),
              googleId: profile.id,
              isAdmin: false,
            });

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const facebookId = profile.id;

            if (!email) {
              // Facebook might not provide email, try to find by facebookId
              let user = await User.findOne({ facebookId });
              if (user) {
                return done(null, user);
              }
              return done(new Error('No email provided by Facebook'), null);
            }

            let user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
              // Link Facebook to existing account if not already linked
              if (!user.facebookId) {
                user.facebookId = facebookId;
                await user.save();
              }
              return done(null, user);
            }

            // Try to find by facebookId if email not available
            user = await User.findOne({ facebookId });
            if (user) {
              // Update email if we now have it
              user.email = email.toLowerCase();
              await user.save();
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              name: profile.displayName || 'Facebook User',
              email: email.toLowerCase(),
              facebookId: facebookId,
              isAdmin: false,
            });

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  return passport;
};

export default initializePassport;
