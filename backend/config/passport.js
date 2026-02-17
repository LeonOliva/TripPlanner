const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://tripplanner-tvpl.onrender.com/api/auth/google/callback"  
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Controlla se l'utente esiste già con questo Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // 2. Se non esiste con Google ID, controlla l'email
      // (Magari si era registrato con email/password prima)
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Se esiste, colleghiamo l'account Google a quello esistente
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // 3. Se non esiste proprio, creiamo un nuovo utente
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        // Password non serve
      });
      await user.save();
      return done(null, user);

    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

module.exports = passport;