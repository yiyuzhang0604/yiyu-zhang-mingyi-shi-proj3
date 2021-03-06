require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./models/User");
const Movie = require("./models/Movie"); 
//const seedDB = require("./seeds");

const bcrypt = require("bcryptjs");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth.js");

const app = express();

const initializePassport = require("./passport-config.js");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static("public"));


// home
// if checkAuth -> false: redirect to login 
// if true: redirected to index page 


app.get("/", checkAuthenticated, (req, res) => {
  res.render("index", { name: req.user.name });
});

app.get("/home", (req, res)=>{
  res.render("home");
})

// register
app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

//login
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({ email: req.body.email });

  if (userFound) {
    req.flash("error", "Email already exists");
    res.redirect("/register");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});


// add new post
app.get("/new", (req,res) => {
  res.render("/movies/add"); 
}); 

// get all movies 
app.get("/movies", (req, res) => {
  Movie.find({}, function(err, allMovies) {
    if (err) {
      console.log(err); 
    } else {
      res.render("movies/index", {
        movies: allMovies, 
        currentUser: req.user,
      });
    }
  });
});


// add new post to database 
app.post("/movies", checkAuthenticated, (req, res) => {
  var rating = req.body.rating; 
  var description = req.body.description; 
  let newMovie = {
    rating: rating, 
    author: {
      id: req.user._id, 
      username: req.user.username,
    },
  }; 
  Movie.create(newMovie, function(err, newlyCreated) {
    if (err) {
      console.log(err); 
    } else {
      res.redirect("/movies"); 
    }
  });
}); 

mongoose
  .connect(
    process.env.SESSION_SECRET, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(3002, () => {
      console.log("Server is running");
    });
  });
