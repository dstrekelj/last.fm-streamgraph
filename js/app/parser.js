define(['js/app'], function(App) {
  
  /**
   * Prepares an array of UTC dates (epoch time) in range `From` - `To`.
   * @param   From  Epoch time (seconds), period start
   * @param   To    Epoch time (seconds), period end
   * @return  Array of UTC dates (epoch time)
   */
  var doDates = function(From, To) {
    var data  = [],
        date  = doDatesPair(From);

    while(date.local.getTime() / 1000 < To) {
      data.push({x: date.utc.getTime(), y: 0});
      date.local.setDate(date.local.getDate() + 1);
      date = doDatesPair(date.local.getTime() / 1000);
    }
    
    // Can't remember why I wrote this. Probably because of an extra entry
    data.pop();
    
    return data;
  };
  
  /**
   * Creates local timezone and UTC Date tuple.
   * @param   Epoch time (in seconds)
   * @return  {local, UTC} Date tuple
   */
  var doDatesPair = function(Time) {
    var local = new Date(Time * 1000),
        utc = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
    return {local: local, utc: utc};
  };
  
  /**
   * Filters data by play limit (high-pass filter).
   * @param   Data    Data to filter
   * @param   Limit   Limit to impose (minimum play amount)
   * @return  Array of artists with `value.y` > `Limit`
   */
  var doFilterByPlays = function(Data, Limit) {
    var key   = 0,
        keys  = Data.length,
        result = new Array();
        
    for (key; key < keys; key++) {
      if (overLimit(Data[key].value, Limit)) result.push(Data[key]);
    }
    
    return result;
  };
  
  function showError(ErrorNumber, ErrorMessage) {
    
    // TODO: update loading indicator
    alert('Error #' + ErrorNumber + ' - ' + ErrorMessage);
    return;
    
  };
  
  this.parse = function parse(Response) {
    
    var datesArray = doDates(parameters.from, parameters.to),
        foundArtist,
        foundPlay,
        recentTracks,
        responseJSON,
        totalPages,
        trackArtist,
        trackDate,
        tracksArray;
    
    responseJSON = JSON.parse(Response);
    
    if (responseJSON.hasOwnProperty('error')) {
      showError(responseJSON.error, responseJSON.message);
    }
    
    recentTracks = responseJSON.recenttracks;
    
    if (!recentTracks['@attr']['totalPages']) {
      showError('02', 'Corrupted response. Please retry request.');
    }
    
    totalPages = parseInt(recentTracks['@attr']['totalPages']);
    
    tracksArray = recentTracks.track;
    
    // TODO: update loading indicator
    
    for (var track in tracksArray) {
      if (tracksArray.hasOwnProperty(track)) {
        trackArtist = tracksArray[track].artist['#text'];
        trackDate = doDatesPair(parseInt(tracksArray[track].date['uts']));
        foundArtist = data.find(function findArtist(E) { return E.key == trackArtist; });
        
        if (foundArtist) {
          foundPlay = foundArtist.value.find(function findPlay(E) { return E.x == trackDate.utc.getTime(); });
          if (foundPlay) foundPlay.y += 1;
        } else {
        }
      }
    }
    
  };
  
  return this;
  
});