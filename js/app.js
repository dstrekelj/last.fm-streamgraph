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
      target            = 'body',
      parameters        = { limit: 200, page: 1 },
      loadingIndicator  = undefined;
  
  var lfm = new LastFM({
    key     : 'b850afad537d9f0e53d131bd0bdf83d6',
    secret  : 'cb2860d672f77ce8aaadee8610e0ac14',
    format  : 'json',
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
      // TODO: Add indicator method?
    }
    else if (defined(parameters.user)
        && parameters.user == Parameters.user
        && parameters.from == Parameters.from
        && parameters.to   == Parameters.to
        && limit           != Parameters.limit)
    {
      // TODO: Add indicator method?
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
    if (defined(loadingIndicator)) loadingIndicator.onUpdate();
    
    var object  = JSON.parse(Response).recenttracks,
        tracks  = object.track,
        pages   = parseInt(object['@attr']['totalPages']);
    
    if (tracks[0].hasOwnProperty('@attr')) tracks.splice(0, 1);
    
    for (var T in tracks) {
      if (tracks.hasOwnProperty(T)) {
        var artist      = tracks[T].artist['#text'],
            date        = doDatesPair(parseInt(tracks[T].date['uts'])),
            foundArtist = data.find(function findArtist(E) {
              return E.key == artist;
            });
        
        if (defined(foundArtist)) {
          var foundPlay = foundArtist.value.find(function findPlay(E) {
            return E.x == date.utc.getTime();
          });
          if (defined(foundPlay)) foundPlay.y += 1;
        } else {
          var dates     = doDates(parameters.from, parameters.to),
              foundPlay = dates.find(function findPlay(E) {
                return E.x == date.utc.getTime();
              });
          if (defined(foundPlay)) foundPlay.y += 1;
          data.push({key: artist, value: dates});
        }
      }
    }
    
    if (parameters.page < pages) {
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
    if (!d3.select('svg').empty()) d3.select('svg').remove();

    // Dimensions, yo
    var dataWidth   = numberOfDays * widthOfDay,
        axisHeight  = 50,
        width       = window.screen.availWidth,
        height      = parseInt(d3.select('#graph').style('height'));

    // SVG
    var svg = d3.select(target)
      .append('svg')
      .attr({
        width   : width,
        height  : height
      });
    
    var group = svg.append('g'),
        label = group.append('text');
    
    // Scales
    var x = d3.time.scale().domain([minX, maxX]).range([0, width]),
        y = d3.scale.linear().domain([0, maxY]).range([axisHeight, height]),
        c = d3.scale.linear().domain([0, Data.length - 1]).interpolate(d3.interpolateRgb).range(['#e55d87', '#5fc3e4']);
    
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

    // Zoom
    var zoom = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .x(x)
      .on('zoom', function onZoom() {
        var e = d3.event,
            tx = Math.max(Math.min(e.translate[0], 0), width - dataWidth),
            ty = 0;
        zoom.translate([tx, ty]);
        group.attr('transform', 'translate(' + tx + ',' + ty + ')');
      });
    
    group.append('g')
      .call(xAxis)
      .attr({
        class      : 'axis',
        transform  : 'translate(0,' + axisHeight + ')'
      });
    
    group.selectAll('path')
      .data(stack(Data))
      .enter()
        .append('path')
        .attr('class', 'stream')
        .attr('d', function pathData(d) { return area(d.value); })
        .style('fill', function pathFill(d, i) { return c(i); })
        .on('mouseover', function(d) { label.text(d.key); })
        .on('mouseleave', function() { label.text(''); });
    
    group.on('mousemove', function() {
      var mouse = d3.mouse(this);
      label.attr({
          x : mouse[0] + 20,
          y : mouse[1] + 20
        })
        .each(function() { this.parentNode.appendChild(this); });
    });
    
    if (!d3.select('.d3-slider').empty()) {
      d3.select('.d3-slider').remove();
      d3.select('#content').append('div').attr('id', 'slider');
    }
    
    // Slider
    d3.select('#slider').call(
      d3.slider().axis(false).value([0, numberOfDays - 1])
        .on('slide', function onSlide(Event, Value) {
          var daysToFirst  = Math.floor((Value[0] / 100) * numberOfDays),
              daysToLast   = Math.floor((Value[1] / 100) * numberOfDays - 1),
              dateFirst = doDatesPair(minX / 1000),
              dateLast  = doDatesPair(minX / 1000);
          
          dateFirst.local.setDate(dateFirst.local.getDate() + daysToFirst);
          dateFirst = doDatesPair(dateFirst.local.getTime() / 1000);
          dateLast.local.setDate(dateLast.local.getDate() + daysToLast);
          dateLast = doDatesPair(dateLast.local.getTime() / 1000);
          
          x.domain([dateFirst.utc.getTime(), dateLast.utc.getTime()]);
          group.select('.axis').call(xAxis);
         
          d3.selectAll('.stream').remove();
          
          group.selectAll('.stream')
            .data(stack(Data))
            .enter()
              .append('path')
              .attr('class', 'stream')
              .attr('d', function pathData(d) { return area(d.value); })
              .style('fill', function pathFill(d, i) { return c(i); })
              .on('mouseover', function(d) { label.text(d.key); })
              .on('mouseleave', function() { label.text(''); });
        })
    );
  };
  
  var doDates = function(From, To) {
    var data  = [],
        date  = doDatesPair(From);

    while(date.local.getTime() / 1000 < To) {
      data.push({x: date.utc.getTime(), y: 0});
      date.local.setDate(date.local.getDate() + 1);
      date = doDatesPair(date.local.getTime() / 1000);
    }
    
    data.pop();
    
    return data;
  };
  
  var doDatesPair = function(Time) {
    var local = new Date(Time * 1000),
        utc = new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
    return {local: local, utc: utc};
  };
  
  /**
   * Filters data by play limit.
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
   */
  var defined = function(Object) {
    return typeof Object != 'undefined';
  };
};
