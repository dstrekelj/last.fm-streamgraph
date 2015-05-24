var Loader = function(Target) {
  var count  = 1,
      target = Target || 'body';
  
  var svg = d3.select(Target)
    .append('svg')
    .attr({
      width: '100%',
      height: parseInt(d3.select('#loader').style('height'))
    });
  
  var rect = svg.append('rect')
    .attr({
      class: 'indicator',
      x: 0,
      y: 0,
      width: 0,
      height: parseInt(d3.select('#loader').style('height'))
    });
  
  d3.select(window).on('resize', function resize() {
    var width   = parseInt(d3.select('#loader').style('width')),
        height  = parseInt(d3.select('#loader').style('height'));
  });
  
  var log = function(Text) {
    d3.select(Target).text(Text);
  };
  
  this.onStart = function() {
    //log('Requesting data...');
  };
  
  this.onUpdate = function(Current, Total) {
    //log('Collecting data... (' + Current + ' / ' + Total + ')');
    console.log(rect.attr('width'));
    rect.transition().attr('width', Math.floor(Current/(Total - 1) * 100) + '%').duration(1000);
    count += 1;
  };
  
  this.onFinish = function() {
    //log('Done! Drawing streamgraph...');
    rect.transition().attr('width', '0%').duration(1000);
    count = 1;
  };
};
