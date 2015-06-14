requirejs.config({
  baseUrl: 'js',
  paths: {
    d3: [
      '//cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min',
      'lib/d3.v3.min'
    ],
    lastfm: [
      'lib/last.fm'
    ]
  }
});

require(['main']);