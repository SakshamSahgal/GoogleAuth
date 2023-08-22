const express = require('express'); //requiring express
const session = require('express-session'); // Import express-session use to manage sessions
const path = require('path'); //requiring path package
require('dotenv').config(); //to load environment variables from a .env file
const app = express();

//--------------------------------------inside another file --------------------------------------/
//GOOGLE AUTH

const passport = require('./Auth'); // Import passport configuration from auth.js
app.use(session({ secret: 'cats', resave: false, saveUninitialized: false })); //telling express to use sesssion middleware [Secret used to sign the session cookie]
app.use(passport.initialize()); //Telling express to use passport for authentication
app.use(passport.session()); // Tell express to use passport.session() to support persistent login sessions (recommended).

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + process.env.PORT || 3000);
})


app.get('/logout', (req, res, next) => {
  res.clearCookie('connect.sid');
  req.logout(function (err) {
    req.session.destroy(function (err) { // destroys the session
      res.redirect("/");
    });
  });
});

app.get("/auth/google", passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account' })); //route for google auth trigger

app.get("/auth/google/callback", passport.authenticate('google', {
  successRedirect: "/protected", //redirect to protected route if login successful
  failureRedirect: "/auth/google/failure" //redirect to failure route if login fails
}));

app.get("/auth/google/failure", (req, res) => {
  res.send("Failed to authenticate..");
})

app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
})

function isLoggedIn(req, res, next) { //Middleware to check if user is logged in
  if (req.user) //check if user is authenticated
    return next();
  else
    res.redirect("/auth/google"); //if not authenticated, redirect to login trigger
}

app.get("/protected", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FrontEnd', 'protected.html'))
})





