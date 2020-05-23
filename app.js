const express = require('express'),
app = express(),
parser = require('body-parser'),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
expressSanitizer = require("express-sanitizer"),
locus = require("locus"),
PORT = process.env.PORT || 3000;


// Connection
const url = "mongodb+srv://kareneadie:iaap0aviZh1AZ9b7@cluster0-vmqgs.mongodb.net/typedDB";


//App Config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(parser.urlencoded({ extended: true }));
app.use(expressSanitizer());
mongoose.connect(url || 'mongodb+srv://kareneadie:iaap0aviZh1AZ9b7@cluster0-vmqgs.mongodb.net/typedDB', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(methodOverride("_method"));

//Mongoose Config
const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    caption: String,
    image: String
});

var Article = module.exports = mongoose.model("Article", newsSchema);



// Testing if items can be added to MongoDB

// Article.create({
//     title: "Test Article Title",
//     image: "https://images.pexels.com/photos/4348556/pexels-photo-4348556.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
//     content: "Test article content goes here"
// },
// function (err, article){
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('New article created');
//         console.log(article);
//     }
//     });




//INDEX
app.get('/', function(req, res){
    res.redirect('/latestnews');
});


app.get('/latestnews', function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Article.find({title: regex}, function(err, articles){
            if(err){
                console.log(err);
            } else {
                if(articles.length < 1) {
                    noMatch = "No articles match your search query. Please try again."
                }
                res.render("index", {articles: articles, noMatch: noMatch});
            };
        })
    } else {
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            res.render("index", {articles: articles, noMatch: noMatch});
        }
    });
}
});

app.get("/about", function(req, res){
    res.render("about");
});

//NEW article
app.get('/new', function(req, res){
    res.render("new");
});

//CREATE
app.post('/latestnews', function (req, res){
//sanitize article
req.body.article.body = req.sanitize(req.body.article.body);
//create article
Article.create(req.body.article, function (err, newArticle){
if (err){
    res.render("new");
} else {
//If successful, redirect to index and display new blog with others
    res.redirect("/latestnews");
}});
});

//SHOW article
app.get('/latestnews/:id', function (req, res){
    Article.findById(req.params.id, function (err, foundArticle){
        if (err){
            res.redirect("/latestnews");
        } else {
            res.render("show", {article: foundArticle});
        }});
});

//EDIT Route
app.get('/latestnews/:id/edit', function (req, res){
    //Find article for edit form
    Article.findById(req.params.id, function(err, foundArticle){
        if (err){
            res.render("/latestnews");
        } else {
            //Edit article form
    res.render("edit", {article: foundArticle});
        }});

});

//UPDATE Route
app.put('/latestnews/:id', function (req, res){
    //sanitize article - prevent script tags
req.body.article.body = req.sanitize(req.body.article.body);
    //Locate blog and update with edits
 Article.findByIdAndUpdate(req.params.id, req.body.article, function (err, updatedArticle){
     if(err){
         res.redirect("/latestnews");
     } else {
         res.redirect("/latestnews/" + req.params.id);
     }});
});

//DELETE Route
app.delete("/latestnews/:id", function (req, res){
    //destroy article
    Article.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/latestnews");
        } else {
            //redirect
            res.redirect("/latestnews");
        }});

});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});
