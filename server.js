var express = require('express');
var app = express();
//parses our HTML and find us elements
var cheerio = require('cheerio');
//makes HTTP request for HTML page
var request = require('request');
//mongo
var mongo = require('mongojs');
//body parser
var bodyParser = require('body-parser');

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

app.get('/about', function(req, res) {
  res.render('pages/about');
});

//making request to the article page. The page's html is passed as the call back's third argument
request("https://medium.com/", function(error, response, html){
  //Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  //An empty array to save the data that we'll scrape
  var results = [];

  for (var i=0; i<$("p.title").length; i++){
  	//you can do this
  	//but you can't chainjQuery methods on it
  	//$("p.title")[i]
  	var title = $("p.title").eq(i).text()
  	var link = $("p.title").eq(i).children().attr("href");

  	results.push({
  		title: title,
  		link: link
  	});
  }

  console.log(results);	
});