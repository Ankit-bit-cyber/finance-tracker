const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const env = require('./env');
const userRepo = require('../modules/user/user.repo');
const { v4: uuidv4 } = require('uuid');

passport.use(new GoogleStrategy(
  {
    clientID: env.google.clientId || 'GOOGLE_CLIENT_ID_PLACEHOLDER',
    clientSecret: env.google.clientSecret || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
    callbackURL: env.google.callbackUrl,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists by google_id
      let user = await userRepo.findByGoogleId(profile.id);
      if (user) return done(null, user);

      // Check if email already exists (link accounts)
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await userRepo.findByEmail(email);
        if (user) {
          // Link google account to existing user
          user = await userRepo.updateGoogleId(user.id, profile.id);
          return done(null, user);
        }
      }

      // Create new user from Google profile
      user = await userRepo.create({
        id: uuidv4(),
        name: profile.displayName,
        email: email || `${profile.id}@google.placeholder`,
        password_hash: null,
        google_id: profile.id,
        avatar_url: profile.photos?.[0]?.value || null,
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepo.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;