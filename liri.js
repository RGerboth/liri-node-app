//liri.js

var fs = require("fs");
var dotEnv = require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
// var inquirer = require("inquirer")

var spotify = new Spotify({
  id: keys.spotify.spotifyID,
  secret: keys.spotify.spotifySecret
});

var client = new Twitter({
  consumer_key: keys.twitter.consumer_key,
  consumer_secret: keys.twitter.consumer_secret,
  access_token_key: keys.twitter.access_token_key,
  access_token_secret: keys.twitter.access_token_secret
});

var commandFile = "random.txt"
var operation = process.argv[2]
var args = ""
var searchTerms = ""

if (operation == "do-what-it-says") {
	fs.readFile(commandFile, "utf8", function(err, data) {
		if (err) {
			return console.log("error reading file: " + err);
		}
		var inputArray = data.split(",")
		operation = inputArray[0]
		args = inputArray[1]
		if (operation == "do-what-it-says") {
			return console.log("Very funny. Very funny indeed...")
		}
		searchTerms = ""
		for (i=1; i<args.length-1; i++) {
			searchTerms += args.charAt(i)		
		}

		search();

	});
} else {
	searchTerms = ""
	searchTerms = process.argv[3]
	for (i=4; i<process.argv.length; i++) {
		searchTerms = searchTerms + " " + process.argv[i]
	}

	search();
}

//conduct query
function search() {
	if (operation == "my-tweets") {
		//twitter
		var params = {screen_name: 'nodejs', count: 20};
		client.get('statuses/user_timeline', params, function(error, tweets, response) {
		  	if (!error) {
				console.log("Here are your latest 20 tweets:")
		  		for (i=0; i<tweets.length; i++) {
		  		console.log("----------------------------------------------------------------------------------------------------")
				console.log("Created at: " + tweets[i].created_at)
				console.log("Text      : " + tweets[i].text)
		  		}
			}
		});

	} else if (operation == "spotify-this-song") {
		if (!searchTerms) {
			searchTerms = "The Sign Ace of Base";
		}
		spotify.search({ type: 'track', query: searchTerms, limit: 2}, function(err, data) {
			var tracks = data.tracks.items
			if (err) {
				return console.log('Error occurred: ' + err);
		    }
		    // console.log below cracks the Spotify data file like a walnut
		    // console.log(data.tracks.items[0])
			console.log("You asked me to Spotify " + searchTerms + ". Here are some fun song facts:")
			console.log("  Artist(s):      " + (tracks[0].artists[0].name))
			console.log("  Song Name:      " + (tracks[0].name))
			console.log("  Album:          " + (tracks[0].album.name))
			if (data.tracks.items[0].preview_url) {
				console.log("  Preview URL:    " + (tracks[0].preview_url))
			} else {
				console.log("  Preview URL:    I'm sorry, there is no preview available for " + (tracks[0].name) + ".") 
				console.log("                  Perhaps the resources below will be helpful.")
				console.log(" ")
				console.log("-- Additional Resources --")
				console.log("  Link to (API):  " + (tracks[0].album.artists[0].href))
				console.log("  Link to (HTML): " + (tracks[0].external_urls.spotify))
			}
		});

	} else if (operation == "movie-this") {
		if (!searchTerms) {
			searchTerms = "Mr. Nobody";
		}
		request('http://www.omdbapi.com/?apikey=trilogy&t=' + searchTerms + '&y=&plot=short', function (err, response, body) {
			if (!err && response.statusCode === 200 && !JSON.parse(body).Error) {
				// console.log below displays full body in JSON format
				// console.log(JSON.parse(body))
				console.log("You asked for " + searchTerms + ". Here are the facts:")
				console.log("  Title:           " + JSON.parse(body).Title)
				console.log("  Year: 	   " + JSON.parse(body).Year)
				console.log("  IMDB Rating:     " + JSON.parse(body).imdbRating)
				if (JSON.parse(body).Ratings.length > 1) {
					console.log("  Rotten Tomatoes: " + JSON.parse(body).Ratings[1].Value)
				} else {
					console.log("  Rotten Tomatoes: I'm sorry, there is no Rotten Tomatoes rating for this film.")
				}
				console.log("  Country:         " + JSON.parse(body).Country)
				console.log("  Language:        " + JSON.parse(body).Language)
				console.log("  Plot:            " + JSON.parse(body).Plot)
				console.log("  Actors:          " + JSON.parse(body).Actors)
			} else {
				console.log("I'm sorry, there was some sort of error. This is what I know: " + (JSON.parse(body).Error));
			}
		});

	} else {
		console.log("Sorry, I don't know what you want me to do. Please be more specific.")
	}
}
