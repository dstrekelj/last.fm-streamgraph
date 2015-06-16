/**
 * Creates new Last.fm API object. The `apiKey` and `apiSecret` properties must be set, `url` defaults to 'http://ws.audioscrobbler.com/2.0/', `format` defaults to XML (JSON if 'json').
 * @param   options   Object containing `key`, `secret`, `url`, `format`
 * @return  LastFM API object
 */
var LastFM = function (options) {
  var apiKey    = options.key    || '';
  var apiSecret = options.secret || '';
  var rootUrl   = options.url    || 'http://ws.audioscrobbler.com/2.0/';
  var format    = options.format || '';
  
  var call = function (method, parameters, callback) {
    var request = '';
    
    request += rootUrl + '?method=' + method;
    
    for (var p in parameters) request += '&' + p + '=' + parameters[p];
    
    request += '&api_key=' + apiKey + ((format != '') ? ('&format=' + format) : '');
    
    var xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
    
    xhr.open('GET', request);
    xhr.send();
  };
  
  /**
   * Commented methods are not implemented yet because they require authenticated calls.
   */
  
  this.album = {
    //addTags: function (parameters, callback) { call('album.addTags', parameters, callback); },
    getBuylinks : function (parameters, callback) { call('album.getBuylinks', parameters, callback); },
    getInfo     : function (parameters, callback) { call('album.getInfo', parameters, callback); },
    getShouts   : function (parameters, callback) { call('album.getShouts', parameters, callback); },
    getTags     : function (parameters, callback) { call('album.getTags', parameters, callback); },
    getTopTags  : function (parameters, callback) { call('album.getTopTags', parameters, callback); },
    //removeTag: function (parameters, callback) { call('album.removeTag', parameters, callback); },
    search      : function (parameters, callback) { call('album.search', parameters, callback); },
    //share: function (parameters, callback) { call('album.share', parameters, callback); },
  };
  
  this.artist = {
    //addTags     : function (parameters, callback) { call('artist.addTags', parameters, share); },
    getCorrection : function (parameters, callback) { call('artist.getCorrection', parameters, callback); },
    getEvents     : function (parameters, callback) { call('artist.getEvents', parameters, callback); },
    getInfo       : function (parameters, callback) { call('artist.getInfo', parameters, callback); },
    getPastEvents : function (parameters, callback) { call('artist.getPastEvents', parameters, callback); },
    getPodcast    : function (parameters, callback) { call('artist.getPodcast', parameters, callback); },
    getShouts     : function (parameters, callback) { call('artist.getShouts', parameters, callback); },
    getSimilar    : function (parameters, callback) { call('artist.getSimilar', parameters, callback); },
    getTags       : function (parameters, callback) { call('artist.getTags', parameters, callback); },
    getTopAlbums  : function (parameters, callback) { call('artist.getTopAlbums', parameters, callback); },
    getTopFans    : function (parameters, callback) { call('artist.getTopFans', parameters, callback); },
    getTopTags    : function (parameters, callback) { call('artist.getTopTags', parameters, callback); },
    getTopTracks  : function (parameters, callback) { call('artist.getTopTracks', parameters, callback); },
    //removeTag: function (parameters, callback) { call('artist.removeTag', parameters, share); },
    search        : function (parameters, callback) { call('artist.search', parameters, callback); },
    //share: function (parameters, callback) { call('artist.share', parameters, callback); },
    //shout: function (parameters, callback) { call('artist.shout', parameters, callback); },
  };
  
  this.user = {
    getArtistTracks     : function (parameters, callback) { call('user.getArtistTracks', parameters, callback); },
    getBannedTrakcs     : function (parameters, callback) { call('user.getBannedTracks', parameters, callback); },
    getEvents           : function (parameters, callback) { call('user.getEvents', parameters, callback); },
    getFriends          : function (parameters, callback) { call('user.getFriends', parameters, callback); },
    getInfo             : function (parameters, callback) { call('user.getInfo', parameters, callback); },
    getLovedTracks      : function (parameters, callback) { call('user.getLovedTracks', parameters, callback); },
    getNeighbours       : function (parameters, callback) { call('user.getNeighbours', parameters, callback); },
    getNewReleases      : function (parameters, callback) { call('user.getNewReleases', parameters, callback); },
    getPastEvents       : function (parameters, callback) { call('user.getPastEvents', parameters, callback); },
    getPersonalTags     : function (parameters, callback) { call('user.getPersonalTags', parameters, callback); },
    getPlaylists        : function (parameters, callback) { call('user.getPlaylists', parameters, callback); },
    //getRecentStations: function (parameters, callback) { call('user.getRecentStations', parameters, callback); },
    getRecentTracks     : function (parameters, callback) { call('user.getRecentTracks', parameters, callback); },
    //getRecommendedArtists: function (parameters, callback) { call('user.getRecommendedArtists', parameters, callback); },
    //getRecommendedEvents: function (parameters, callback) { call('user.getRecommendedEvents', parameters, callback); },
    getShouts           : function (parameters, callback) { call('user.getShouts', parameters, callback); },
    getTopAlbums        : function (parameters, callback) { call('user.getTopAlbums', parameters, callback); },
    getTopArtists       : function (parameters, callback) { call('user.getTopArtists', parameters, callback); },
    getTopTags          : function (parameters, callback) { call('user.getTopTags', parameters, callback); },
    getTopTracks        : function (parameters, callback) { call('user.getTopTracks', parameters, callback); },
    getWeeklyAlbumChart : function (parameters, callback) { call('user.getWeeklyAlbumChart', parameters, callback); },
    getWeeklyArtistChart: function (parameters, callback) { call('user.getWeeklyArtistChart', parameters, callback); },
    getWeeklyChartList  : function (parameters, callback) { call('user.getWeeklyChartList', parameters, callback); },
    getWeeklyTrackChart : function (parameters, callback) { call('user.getWeeklyTrackChart', parameters, callback); },
    //shout: function (parameters, callback) { call('user.shout', parameters, callback); },
    //signUp: function (parameters, callback) { call('user.signUp', parameters, callback); },
    //terms: function (parameters, callback) { call('user.terms', parameters, callback); },
  };
};