define(['d3'], function(d3) {
  
  var count = 1,
      target = '#loader';
  
  var label = d3.select('#label');
  
  var svg = d3.select(target)
    .append('svg')
    .attr({
      height :  '4px',
      width :   '100%'
    });
  
  var rect = svg.append('rect')
    .attr({
      class :   'indicator',
      height :  '4px',
      width :   0,
      x :       0,
      y :       0
    });
  
  /**
   * Called by application when error occurs.
   * @param Error Application error, e.g. {error: 0, message: 'unknown error'}
   */
  function onError(Error) {
    label.text('Error #' + Error.error + ' - ' + Error.message);
  };
  
  /**
   * Called by application on last response.
   */
  function onFinish() {
    label.text('');
    rect.transition().attr('width', '0%').duration(1000);
    count = 1;
  };
  
  /**
   * Called by application on first request.
   */
  function onStart() {
    label.text('Requesting data...');
    rect.transition().attr('width', '0%').duration(1000);
  };
  
  /**
   * Called by application on every request.
   * @param Current Current request, provided by application
   * @param Total   Total requests to receive, provided by application
   */
  function onUpdate(Current, Total) {
    label.text('Receiving response... (' + count + ')');
    rect.transition().attr('width', Math.floor(Current / (Total - 1) * 100) + '%').duration(1000);
    count += 1;
  };
  
  return {
    onError :   onError,
    onFinish :  onFinish,
    onStart :   onStart,
    onUpdate :  onUpdate
  };
  
});