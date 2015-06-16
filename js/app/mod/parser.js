define(['app/mod/data', 'app/mod/errors', 'app/mod/grapher', 'helper', 'app/mod/lfm', 'ui/loader'], function(Data, Errors, Grapher, Helper, LFM, Loader) {
  
  function parse(Response) {
    var json = JSON.parse(Response);
    
    // Check if response object has an error attached to it
    if (json.hasOwnProperty('error')) {
      Loader.onError({ error : Response.error, message : Response.message });
      return;
    }
    
    var recentTracks = json.recenttracks;
    
    // Check if response object is empty
    if (recentTracks.totalPages == '0') {
      Loader.onError(Errors.EMPTY_RESPONSE);
      return;
    }
    
    // Check if response came with required attributes
    if (!Helper.defined(recentTracks['@attr']['totalPages'])) {
      Loader.onError(Errors.CORRUPT_RESPONSE);
      return;
    }
    
    var thisPage =    parseInt(recentTracks['@attr']['page']),
        totalPages =  parseInt(recentTracks['@attr']['totalPages']),
        tracks =      recentTracks.track;
    
    Loader.onUpdate(thisPage, totalPages);
    
    // Do not count tracks currently being listened to
    if (tracks[0].hasOwnProperty('@attr')) tracks.splice(0, 1);
    
    var artist,
        date,
        foundArtist,
        foundPlay,
        dateRange;
    
    for (var i = 0, l = tracks.length; i < l; i++) {
      artist =  tracks[i].artist['#text'];
      date =    Helper.doDatesPair(parseInt(tracks[i].date['uts']));
      
      foundArtist = Data.data.find(function(E) { return E.key == artist; });
      
      if (Helper.defined(foundArtist)) {
        foundPlay = foundArtist.value.find(function(E) { return E.x == date.utc.getTime(); });
        
        if (Helper.defined(foundPlay)) { foundPlay.y += 1; }
      } else {
        dateRange = Helper.doDates(LFM.parameters.from, LFM.parameters.to);
        foundPlay = dateRange.find(function(E) { return E.x == date.utc.getTime(); });
        
        if (Helper.defined(foundPlay)) { foundPlay.y += 1; }
        
        Data.data.push({ key : artist, value : dateRange });
      }
    }
    
    if (thisPage < totalPages) {
      LFM.parameters.page += 1;
      LFM.methods.user.getRecentTracks(LFM.parameters, parse);
    } else {
      Loader.onFinish();
      Grapher.draw();
    }
  };
  
  return {
    parse : parse
  };
  
});