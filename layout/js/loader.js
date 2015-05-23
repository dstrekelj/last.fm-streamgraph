var Loader = function(Target) {
  var count  = 1,
      target = Target || 'body';
  
  var log = function(Text) {
    d3.select(Target).text(Text);
  };
  
  this.onStart = function() {
    log('Requesting data...');
  };
  
  this.onUpdate = function() {
    log('Collecting data... (' + count + ')');
    count += 1;
  };
  
  this.onFinish = function() {
    log('Done! Drawing streamgraph...');
    count = 1;
  };
};
