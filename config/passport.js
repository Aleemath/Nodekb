const LocalStrategy = require("passport-local").Strategy;
const User = require("../model/user");
const config = require("../config/database");
const bcrypt = require("bcryptjs");

// module.exports = function (passport) {
//   //local strategy
//   passport.use(
//     new LocalStrategy(async function (username, password, done) {
//       //match username

//       let query = { username: username };
//       User.findOne(query, function (err, user) {
//         if (err) throw err;
//         if (!user) {
//           return done(null, false, { message: "No user found" });
//         }

//         //match password
//         bcrypt.compare(password, user.password, function (err, isMatch) {
//           if (err) throw err;
//           if (isMatch) {
//             return done(null, user);
//           } else {
//             return done(null, false, { message: "Wrong password" });
//     //       }
//         });
//       });
//     })
//   );

//   passport.serializeUser(function (user, done) {
//     done(null, user.id);
//   });
//   passport.deserializeUser(function (id, done) {
//     User.findById(id, function (err, user) {
//       done(err, user);
//     });
//   });
// };

module.exports = function (passport) {
  // Local strategy
  passport.use(
    new LocalStrategy(async function (username, password, done) {
      try {
        // Match username
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "No user found" });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Wrong password" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
