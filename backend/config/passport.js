import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/userModel.js";


/* ---------------- GOOGLE STRATEGY ---------------- */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOneAndUpdate(
          { googleId: profile.id },
          { isLoggedIn: true },
          { new: true },
        );

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            isLoggedIn: true,
            isVerified: true,
          });
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    },
  ),
);

/* ---------------- JWT STRATEGY (🔥 REQUIRED) ---------------- */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select("-password");
        if (!user) {
          return done(null, false);
        }
        return done(null, user); // 👉 req.user set here
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);
