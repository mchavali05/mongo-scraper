var express = require('express');
var app = express();
//parses our HTML and find us elements
var cheerio = require('cheerio');
//makes HTTP request for HTML page
var request = require('request');
//mongo
var mongojs = require('mongojs');
//body parser
var bodyParser = require('body-parser');

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

//check what server.js is doing via console
console.log("grab everything");

// index page 
app.get('/', function(req, res) {
  res.render('pages/index')
});

// app.get('/about', function(req, res) {
//   res.render('pages/about');
// });


// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongo db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`
  request("https://medium.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".title").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// //making request to the article page. The page's html is passed as the call back's third argument
// request("https://medium.com/", function(error, response, html){
//   //Load the HTML into cheerio and save it to a variable
//   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//   var $ = cheerio.load(html);

//   //An empty array to save the data that we'll scrape
//   var results = [];

//   for (var i=0; i<$("p.title").length; i++){
//   	//you can do this
//   	//but you can't chainjQuery methods on it
//   	//$("p.title")[i]
//   	var title = $("p.title").eq(i).text()
//   	var link = $("p.title").eq(i).children().attr("href");

//   	results.push({
//   		title: title,
//   		link: link
//   	});
//   }

//   console.log(results);	
// });

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});