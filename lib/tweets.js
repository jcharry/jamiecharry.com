var cred = require('./cred.json');
var Twitter = require('twitter');
var Sentiment = require('sentiment');

var client = new Twitter({
  consumer_key: cred.APP_KEY,
  consumer_secret: cred.APP_SECRET, 
  access_token_key: cred.ACCESS_TOKEN,
  access_token_secret: cred.ACCESS_TOKEN_SECRET
});

exports.fetchTweets = function(str, callback) {

  console.log('string passed: ' + str);

  client.get('search/tweets', {q: 'feel ' + str}, function(error, tweets, response){
    if (!error) {
      for (var i = 0; i < tweets.statuses.length; i++) {
	tweets.statuses[i].sentiment = Sentiment(tweets.statuses[i].text);
      }
      callback(tweets);
    }
  });
};
