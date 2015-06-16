define(['app/mod/data', 'app/mod/errors', 'app/mod/grapher', 'helper', 'app/mod/lfm', 'ui/loader', 'app/mod/parser'], function(Data, Errors, Grapher, Helper, LFM, Loader, Parser) {
  
  function request(Parameters) {    
    var p = [LFM.parameters.user, LFM.parameters.from, LFM.parameters.to],
        P = [Parameters.user, Parameters.from, Parameters.to];
    
    if (Helper.equal(p, P) && Data.minimumPlays == Parameters.minimumPlays) {
      Loader.onError(Errors.NO_CHANGE);
    } else {
      if (Helper.equal(p, P) && Data.minimumPlays != Parameters.minimumPlays) {
        Data.minimumPlays = Parameters.minimumPlays;
        Grapher.draw();
      } else {
        Data.data = [];
        Data.minimumPlays = Parameters.minimumPlays;
        LFM.parameters.user = Parameters.user;
        LFM.parameters.from = Parameters.from;
        LFM.parameters.to = Parameters.to;
        LFM.parameters.page = 1;
        
        Loader.onStart();
        
        LFM.methods.user.getRecentTracks(LFM.parameters, Parser.parse);
      }
    }
  };
  
  return {
    request : request
  };
  
});
