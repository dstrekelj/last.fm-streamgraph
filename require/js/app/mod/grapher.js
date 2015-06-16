define(['d3', 'app/mod/data', 'app/mod/lfm'], function(d3, Data, LFM) {
  
  function draw() {
    var dataset = Data.filterByPlays(Data.data, Data.minimumPlays);
    
    var numberOfDays = dataset[0].value.length,
        widthOfDay = 40,
        maxY = Data.findMaxY(dataset),
        minX = dataset[0].value[0].x,
        maxX = dataset[0].value[numberOfDays - 1].x;
    
    if (!d3.select('#streamgraph').empty()) d3.select('#streamgraph').remove();
    
    var axisHeight = 20,
        dataWidth = numberOfDays * widthOfDay,
        height = parseInt(d3.select('#graph').style('height')),
        sliderHeight = 20,
        statsHeight = 10,
        width = document.body.clientWidth;
    
    var svg = d3.select('#graph')
      .append('svg')
      .attr({
        height : height,
        id : 'streamgraph',
        width : '100%'
      });
    
    var group = svg.append('g'),
        label = d3.select('#label');
    
    var stats = svg.append('g')
      .append('text')
      .attr({
        x : '50%',
        y : height - sliderHeight - statsHeight,
        'text-anchor' : 'middle',
        'alignment-baseline' : 'alphabetic'
      })
      .text('unique artists: ' + dataset.length + ' / most tracks in a day: ' + Data.findMaxY(Data.data));
    
    var x = d3.time.scale().domain([minX, maxX]).range([0, width]),
        y = d3.scale.linear().domain([0, maxY]).range([axisHeight, height - sliderHeight - statsHeight]),
        //c = d3.scale.linear().domain([0, dataset.length - 1]).interpolate(d3.interpolateRgb).range(['#b32024', '#0187c5']);
        c = d3.scale.category20();
    
    // Axis
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .innerTickSize(-height)
      .outerTickSize(0)
      .ticks(d3.time.week)
      .tickPadding(8)
      .tickFormat(d3.time.format('%d. %b'));
    
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
      .data(stack(dataset))
      .enter()
        .append('path')
        .attr({
          class : 'stream',
          d     : function pathData(d) { return area(d.value); }
        })
        .style('fill', function pathFill(d, i) { return c(i); })
        .on('mouseenter', function mouseEnter(d, i) {
          if (d3.selectAll('.stream.clicked').empty()) {
            label.text(d.key);
            d3.select(this).classed('focus', true);
            d3.selectAll('.stream').classed('blur', function(d, j) { return i != (j + 1); });
          }
        })
        .on('mouseleave', function mouseLeave() {
          if (d3.selectAll('.stream.clicked').empty()) {
            label.text('');
            d3.select(this).classed('focus', false);
            d3.selectAll('.stream').classed('blur', false);
          }
        })
        .on('click', function click(d, i) {
          //d3.select(this).classed('clicked', !d3.select(this).classed('clicked'));
          if (d3.select(this).classed('clicked')) {
            d3.select(this).classed('clicked', false);
            d3.selectAll('.stream').classed('blur', false);
          } else {
            if (d3.selectAll('.stream.clicked').empty()) {
              d3.select(this).classed('clicked', true);
              d3.selectAll('.stream').classed('blur', function(d, j) { return i != j + 1; });
              d3.selectAll('.stream').classed('focus', function(d, j) { return i == j + 1; });
            }
          }
        });
    
    // Slider
    var sliderHeight  = 20,
        sliderScale   = d3.time.scale().domain([minX, maxX]).range([0, width]),
        slider        = svg.append('g');
    
    var brush = d3.svg.brush()
      .x(sliderScale)
      .extent([minX, maxX])
      .on('brush', sliderBrush);
    
    slider.append('rect')
      .attr('class', 'slider-container')
      .attr({
        x     : 0,
        y     : height - sliderHeight,
        width : width,
        height: sliderHeight
      });
    
    slider.append('g')
      .attr('class', 'slider-brush')
      .call(brush)
      .selectAll('rect')
      .attr({
        y     : height - sliderHeight,
        height: sliderHeight
      });
    
    function sliderBrush() {
      var min = Math.floor(brush.extent()[0]),
          max = Math.floor(brush.extent()[1]);
      
      x.domain([min, max]);
      group.select('.axis').call(xAxis);
      group.selectAll('.stream')
        .data(stack(dataset))
        .attr('d', function pathData(d) { return area(d.value); });
    };
    
    d3.select(window).on('resize', function resize() {
      var newWidth = parseInt(d3.select('#graph').style('width'), 10);
      
      sliderScale.range([0, newWidth]);
      slider.select('.slider-container').attr('width', newWidth);
      slider.select('.slider-brush').call(brush);
      
      x.range([0, newWidth]);
      group.select('.axis').call(xAxis);
      group.selectAll('.stream')
        .data(stack(dataset))
        .attr('d', function pathData(d) { return area(d.value); });
    });
    
    /*
    group.on('mousemove', function() {
      var mouse = d3.mouse(this);
      label.attr({x: mouse[0] + 20, y: mouse[1] + 20});
    });
    */
  };
  
  return {
    draw : draw
  };
  
});