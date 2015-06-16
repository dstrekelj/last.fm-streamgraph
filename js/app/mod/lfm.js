define(['lastfm'], function() {
    
  var lfm = new LastFM({
    format :  'json',
    key :     'b850afad537d9f0e53d131bd0bdf83d6',
    secret :  'cb2860d672f77ce8aaadee8610e0ac14'
  });
  
  var parameters = {
    from :  null,
    limit : 200,
    page :  1,
    to :    null,
    user :  null
  };
  
  return {
    methods :     lfm,
    parameters :  parameters
  };
  
});