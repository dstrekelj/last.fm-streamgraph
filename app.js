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
  var data        = [],
      limit       = 0,
      target      = 'body',
      parameters  = {limit: 200, page: 1};
  
  var lfm = new LastFM({
    key     : 'b850afad537d9f0e53d131bd0bdf83d6',
    secret  : 'cb2860d672f77ce8aaadee8610e0ac14',
    format  : 'json',
  });
  
  this.request = function(Parameters, Target) {
    data = [];
    limit = Parameters.limit;
    target = Target || 'body';
    
    parameters['user'] = Parameters.user;
    parameters['from'] = Parameters.from;
    parameters['to'] = Parameters.to;
    
    lfm.user.getRecentTracks(parameters, responseHandler);
  };
  
  var responseHandler = function(Response) {
    console.log('Collecting data...');
    
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
      parameters.page = 1;
      console.log(data);
      draw(data);
    }
  };
  
  var draw = function(Data) {
    Data = filterByPlays(Data, limit);

    var dataCount = Data.length,
        dataX = Data[0].value.length,
        dataY = 120,
        minX = Data[0].value[0].x,
        maxX = Data[0].value[Data[0].value.length - 1].x;

    var width = dataX * 32,
        height = parseInt(d3.select('#graph').style('height')),
        svg = d3.select(target).append('svg').attr({width: width, height: height});

    var x = d3.time.scale().domain([minX, maxX]).range([0, width]),
        y = d3.scale.linear().domain([0, dataY]).range([100, height]),
        c = d3.scale.linear().domain([0, dataCount - 1]).interpolate(d3.interpolateRgb).range(['#e55d87', '#5fc3e4']);
    
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(8)
      .tickFormat(d3.time.format('%d. %B'));
    
    var label = svg.append('text');

    var stack = d3.layout.stack()
      .offset('silhouette')
      .values(function(d) { return d.value; })
      .x(function(d, i) { return d.x; })
      .y(function(d) { return d.y; });

    var area = d3.svg.area()
      .interpolate('basis-open')
      .x(function(d, i) { return x(d.x); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

    svg.append('g').call(xAxis).attr('class', 'axis').attr('transform', 'translate(0, 50)');
    
    svg.selectAll('path')
      .data(stack(Data))
      .enter()
        .append('path')
        .attr('d', function(d) { return area(d.value); })
        .style({'stroke': 'rgba(255,255,255,0.5)', 'stroke-width': 2})
        .style('fill', function(d, i) { return c(i); })
        .on('mouseover', function(d) { label.text(d.key); })
        .on('mouseleave', function() { label.text(''); });

    svg.on('mousemove', function() {
      var mouse = d3.mouse(this);
      label.attr({x: mouse[0] + 20, y: mouse[1] + 20})
        .each(function() { this.parentNode.appendChild(this); });
    });
  };
  
  var filterByPlays = function(Data, Limit) {
    return Data = Data.filter(function(v) {
      for (var vi = 0; vi < v.value.length; vi++) {
        if (v.value[vi].y > Limit) return true;
      }
      return false;
    });
  };
  
  var defined = function(Object) {
    return typeof Object != 'undefined';
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
};
