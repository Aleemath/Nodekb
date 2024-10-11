const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Article = require("../model/article");
const mongoose = require("mongoose");
const User = require("../model/user");

// Route
router.get("/", async (req, res) => {
  const articles = await Article.find({});
  // console.log("Fetched articles:", articles);

  res.render("index", {
    title: "Articles",
    articles,
  });
});

//get single article
router.get("/:id", async (req, res) => {
  // console.log("Received ID:", req.params.id);
  try {
    const articleId = req.params.id;

    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(400).send("Invalid Article ID");
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).send("Article not found");
    }
    console.log("Article found:", article);
    const user = await User.findById(article.author);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("article", {
      article,
      author: user.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}
// add route
router.get("/add/new", ensureAuthenticated, (req, res) => {
  console.log(req.body);
  res.render("add_article", {
    title: "Add Article",
  });
});

// Save route
router.post(
  "/add",
  [
    body("title").notEmpty().withMessage("Title is required"),
    // body("author").notEmpty().withMessage("Author is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],

  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, render the form again with errors
      return res.render("add_article", {
        title: "Add Article",
        errors: errors.array(),
      });
    }

    const { title, author, description } = req.body;

    let article = new Article({
      title: req.body.title,
      author: req.user._id,
      description: req.body.description,
    });

    try {
      const createdArticle = await article.save();

      if (createdArticle) {
        req.flash("success", "Article Added");
        return res.redirect("/articles");
      }
    } catch (err) {
      // Handle any errors that occur while saving
      console.error(err);
      req.flash("error", "Failed to add article");
      return res.redirect("/articles/add");
    }
  }
);

//load edit form
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);
    if (article.author != req.user._id) {
      req.flash("danger", "Not authorized");
      res.redirect("/articles");
    }
    if (!article) {
      return res.status(404).send("Article not found");
    }

    res.render("edit_article", {
      title: "Edit Article",
      article,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//update submit post route
router.post("/edit/:id", async (req, res) => {
  const { title, author, description } = req.body;
  let updatedArticle = {
    title,
    author,
    description,
  };
  let articleId = req.params.id;
  console.log(req.params);

  try {
    const result = await Article.findByIdAndUpdate(articleId, updatedArticle, {
      new: true,
    });
    if (!result) {
      return res.status(404).send("Article not found");
    }

    req.flash("success", "Article Updated");
    res.redirect("/articles");
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).send("Server Error. Please try again later.");
  }
});

//delete one
router.delete("/:id", async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(500).send();
  }

  const articleId = req.params.id;

  try {
    const result = await Article.findByIdAndDelete(articleId);
    Article.findById(req.params.id, function (err, article) {
      if (article.author != req.user._id) {
        res.status(500).send();
      }
    });

    if (!result) {
      return res.status(404).send("Article not found");
    }

    console.log("Article deleted successfully");
    res.send("Article deleted successfully");
    // res.redirect("/articles");
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
