const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

function initialize(passport, getUserByEmail, getUserById) {
    // third variable: done()
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);
    if (user == null) {
        // error, return statement, message
      return done(null, false, { message: "No user with that email" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (err) {
      return done(e);
    }
  };

  //second variable: function to authenticate 
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  // serialize the user into single id 
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    return done(null, await getUserById(id));
  });
}

module.exports = initialize;
