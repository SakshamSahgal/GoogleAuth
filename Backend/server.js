const express = require('express'); //requiring express
const session = require('express-session'); // Import express-session use to manage sessions
const passport = require('passport');
const path = require('path'); //requiring path package
const GoogleStrategy = require('passport-google-oauth20').Strategy; //importing Google Auth Strategy
require('dotenv').config(); //to load environment variables from a .env file
const app = express();

app.use(session({ secret: 'cats', resave: false, saveUninitialized: false })); //telling express to use sesssion middleware [Secret used to sign the session cookie]
app.use(passport.initialize()); //Telling express to use passport for authentication
app.use(passport.session()); // Tell express to use passport.session() to support persistent login sessions (recommended).


app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + process.env.PORT || 3000);
})

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback" //Route to call after signin is successful
}, (accessToken, refreshToken, profile, done) => {
  return done(null,profile);
}));

passport.serializeUser((user, done) => { 
  console.log("success serializing")
  done(null, user);
});

passport.deserializeUser((user, done) => { 
  console.log("success deserializing")
  done(null, user);
})

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
})


app.get("/auth/google", passport.authenticate('google', { scope: ['email','profile'], prompt: 'select_account' })); //route for google auth trigger

app.get("/auth/google/callback", passport.authenticate('google', { 
successRedirect: "/protected" , //redirect to protected route if login successful
failureRedirect: "/auth/google/failure" //redirect to failure route if login fails
}));

app.get('/logout', (req, res, next) => {
  res.clearCookie('connect.sid'); 
  req.logout(function(err) {
    console.log(err)
    req.session.destroy(function (err) { // destroys the session
        res.redirect("/");      
    });
  });
});

app.get("/auth/google/failure", (req, res) => {
  res.send("Failed to authenticate..");
})


function isLoggedIn(req, res, next) { //Middleware to check if user is logged in
  if (req.user) //check if user is authenticated
    return next();
  else
    res.redirect("/auth/google"); //if not authenticated, redirect to login trigger
}

app.get("/protected",isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FrontEnd', 'protected.html'))
})





