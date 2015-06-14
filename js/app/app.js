require(['lastfm'], function() {
  
  console.log('-- app/app --');
  
  var lfm = new LastFM({
    format: 'json',
    key:    'b850afad537d9f0e53d131bd0bdf83d6',
    secret: 'cb2860d672f77ce8aaadee8610e0ac14'
  });
  
});