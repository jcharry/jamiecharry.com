var Sentiment = require('sentiment');

exports.getSentiment = function(str) {
  return Sentiment(str);
};
