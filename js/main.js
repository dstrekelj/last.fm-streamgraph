require.config({
  baseURL :   'js',
  paths : {
    d3 :      'lib/d3.v3.min',
    lastfm :  'lib/last.fm'
  }
});

require(['ui/parseForm', 'app/app', 'ui/populateDropdown', 'polyfill', 'ui/notifier'], function(ParseForm, App) {
  
  function onClick(Event) {
    Event.preventDefault();
    var data =  ParseForm(document.forms.namedItem('parameters')),
        from =  new Date(Date.UTC(data.fromY, data.fromM, data.fromD)),
        to =    new Date(Date.UTC(data.toY, data.toM, data.toD));

    var params = {
      user :          data.user,
      minimumPlays :  data.minimumPlays,
      from :          from.getTime() / 1000,
      to :            to.getTime() / 1000
    };

    App.request(params);
  }

  document.getElementById('parameters').addEventListener('submit', onClick, false);
  
});
