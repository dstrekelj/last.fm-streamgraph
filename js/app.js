/**
 * Array.prototype.find() polyfill.
 * 
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var App = function() {
  var data              = [],
      limit             = '0',
      loadingIndicator  = undefined,
      parameters        = { limit: 200, page: 1 },
      target            = 'body';
  
  var lfm = new LastFM({
    format  : 'json',
    key     : 'b850afad537d9f0e53d131bd0bdf83d6',
    secret  : 'cb2860d672f77ce8aaadee8610e0ac14'
  });
  
  /**
   * Set loading indicator. The indicator's `onStart()` method is called when
   * the request is made. The `onUpdate()` method is called when the response
   * is handler. The `onFinish()` method is called when the process is done.
   * 
   * @param LoadingIndicator  Object that must have accessible `onStart()`, `onUpdate()`, and `onFinish()` methods
   */
  this.setLoadingIndicator = function(LoadingIndicator) {
    loadingIndicator = LoadingIndicator;
  };
  
  this.request = function(Parameters, Target) {
    target = Target || 'body';
    
    if (defined(parameters.user)
        && parameters.user == Parameters.user
        && parameters.from == Parameters.from
        && parameters.to == Parameters.to
        && limit == Parameters.limit)
    {
      if (defined(loadingIndicator)) loadingIndicator.onError({ error: '1', message: 'No change in parameters. No request will be sent.' });
    }
    else if (defined(parameters.user)
        && parameters.user == Parameters.user
        && parameters.from == Parameters.from
        && parameters.to   == Parameters.to
        && limit           != Parameters.limit)
    {
      limit = Parameters.limit;
      draw(data);
    }
    else    
    {
      data = [];
      limit = Parameters.limit;
      parameters['user']  = Parameters.user;
      parameters['from']  = Parameters.from;
      parameters['to']    = Parameters.to;
      parameters['page']  = 1;

      if (defined(loadingIndicator)) loadingIndicator.onStart();

      lfm.user.getRecentTracks(parameters, responseHandler);
    }
  };
  
  /**
   * Handles the formatted string response and prepares the data for drawing.
   */
  var responseHandler = function(Response) {
    var responseJSON = JSON.parse(Response);
    
    // If the response has an error property, alert user with message and abort
    if (responseJSON.hasOwnProperty('error')) {
      alert('Error ' + responseJSON.error + ' - ' + responseJSON.message + '!');
      return;
    }
    
    var recentTracks  = responseJSON.recenttracks,
        totalPages    = parseInt(recentTracks['@attr']['totalPages']),
        tracksArray   = recentTracks.track;
    
    // Update loading indicator
    if (defined(loadingIndicator)) loadingIndicator.onUpdate(parseInt(parameters.page), parseInt(totalPages));
    
    // If a track is currently being listened to by user, ignore it
    if (tracksArray[0].hasOwnProperty('@attr')) tracksArray.splice(0, 1);
    
    for (var track in tracksArray) {
      if (tracksArray.hasOwnProperty(track)) {
        // Check if the current artist in `tracksArray` exists in `data`
        var trackArtist = tracksArray[track].artist['#text'],
            trackDate   = doDatesPair(parseInt(tracksArray[track].date['uts'])),
            foundArtist = data.find(function findArtist(E) {
              return E.key == trackArtist;
            });
        // If he does, find play date in `data` and increment play count
        if (defined(foundArtist)) {
          var foundPlay = foundArtist.value.find(function findPlay(E) {
            return E.x == trackDate.utc.getTime();
          });
          
          if (defined(foundPlay)) foundPlay.y += 1;
        // No artist? Generate play dates and add the artist to `data`
        } else {
          var datesArray  = doDates(parameters.from, parameters.to),
              foundPlay   = datesArray.find(function findPlay(E) {
                return E.x == trackDate.utc.getTime();
              });
          
          if (defined(foundPlay)) foundPlay.y += 1;
          
          data.push({key: trackArtist, value: datesArray});
        }
      }
    }
    
    // Continue through all response pages and draw when done
    if (parameters.page < totalPages) {
      parameters.page += 1;
      lfm.user.getRecentTracks(parameters, responseHandler);
    } else {
      if (defined(loadingIndicator)) loadingIndicator.onFinish();
      draw(data);
    }
  };
  
  /**
   * Draws the stramgraph.
   * @param Data  The data to draw
   */
  var draw = function(Data) {
    // Filter data by plays
    Data = doFilterByPlays(Data, limit);
    
    // Get data ...about data?
    var numberOfDays  = Data[0].value.length,
        widthOfDay    = 40,
        maxY          = doFindMaxY(Data),
        minX          = Data[0].value[0].x,
        maxX          = Data[0].value[Data[0].value.length - 1].x;
    
    // If a graph already exists, remove and replace it
    if (!d3.select('#streamgraph').empty()) d3.select('#streamgraph').remove();

    // Dimensions, yo
    var dataWidth   = numberOfDays * widthOfDay,
        axisHeight  = 20,
        sliderHeight= 20,
        width       = document.body.clientWidth,
        height      = parseInt(d3.select('#graph').style('height'));

    // SVG
    var svg = d3.select(target)
      .append('svg')
      .attr({
        id      : 'streamgraph',
        width   : '100%',
        height  : height
      });
    
    var group = svg.append('g'),
        label = d3.select('#label');
    
    // Scales
    var x = d3.time.scale().domain([minX, maxX]).range([0, width]),
        y = d3.scale.linear().domain([0, maxY]).range([axisHeight, height - sliderHeight]),
        c = d3.scale.linear().domain([0, Data.length - 1]).interpolate(d3.interpolateRgb).range(['#b32024', '#0187c5']);
    
    // Axis
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .innerTickSize(-height)
      .outerTickSize(0)
      .ticks(d3.time.week)
      .tickPadding(8)
      .tickFormat(d3.time.format('%d. %B'));
    
    // Stack
    var stack = d3.layout.stack()
      .offset('silhouette')
      .values(function stackValues(d) { return d.value; })
      .x(function stackX(d, i) { return d.x; })
      .y(function stackY(d) { return d.y; });
    
    // Area
    var area = d3.svg.area()
      .interpolate('basis')
      .x(function areaX(d, i) { return x(d.x); })
      .y0(function areaY0(d) { return y(d.y0); })
      .y1(function areaY1(d) { return y(d.y0 + d.y); });

    group.append('g')
      .call(xAxis)
      .attr({
        class     : 'axis',
        transform : 'translate(0,' + axisHeight + ')'
      });
    
    group.selectAll('path')
      .data(stack(Data))
      .enter()
        .append('path')
        .attr({
          class : 'stream',
          d     : function pathData(d) { return area(d.value); }
        })
        .style('fill', function pathFill(d, i) { return c(i); })
        .on('mouseenter', function mouseEnter(d, i) {
          label.text(d.key);
          d3.select(this).classed('focus', true);
          d3.selectAll('.stream').classed('blur', function(d, j) { return i != (j + 1); });
        })
        .on('mouseleave', function mouseLeave() {
          label.text('');
          d3.select(this).classed('focus', false);
          d3.selectAll('.stream').classed('blur', false);
        })
        .on('click', function click(d, i) {
          d3.select(this).classed('clicked', !d3.select(this).classed('clicked'));
        });
    
    d3.select(window).on('resize', function resize() {
      x.range([0, parseInt(d3.select('#graph').style('width'), 10)]);
      group.select('.axis').call(xAxis);
      group.selectAll('.stream')
        .data(stack(Data))
        .attr('d', function pathData(d) { return area(d.value); });
    });
    
    /*
    group.on('mousemove', function() {
      var mouse = d3.mouse(this);
      label.attr({x: mouse[0] + 20, y: mouse[1] + 20});
    });
    */
  };
  
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
  
  /**
   * Finds largest number of plays in a day in observed period.
   * @param   Data    Data to search through
   * @return  Number of plays
   */
  var doFindMaxY = function(Data) {
    var key   = 0,
        keys  = Data.length,
        val   = 0,
        vals  = Data[0].value.length,
        sum   = 0;
    
    for (val; val < vals; val++) {
      var newSum = 0, key = 0;
      
      for (key; key < keys; key++) {
        newSum += Data[key].value[val].y;
      }
      
      if (newSum > sum) sum = newSum;
    }
    
    return sum;
  };  
  
  /**
   * Checks if `Values` array has a value greater than `Limit`.
   * @param   Values  Array of values
   * @param   Limit   Lower limit
   * @return  `true` if it has, `false` if not
   */
  var overLimit = function(Values, Limit) {
    var play  = 0,
        plays = Values.length;
    
    for (play; play < plays; play++) {
      if (Values[play].y > Limit) return true;
    }
    
    return false;
  };
  
  /**
   * Checks if `Object` is not undefined.
   * @param   Object  The object to check
   * @return  `true` if defined, `false` if not
   */
  var defined = function(Object) {
    return typeof Object != 'undefined';
  };
};
