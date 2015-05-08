var app = new App();

document.getElementById('parameters').addEventListener('submit', function(e) {
  e.preventDefault();
  app.request({
    user  : 'bigidiot',
    from  : 1422748800,
    to    : 1430438400,
    limit : 10},
    '#graph');
  }, false
);

//app.request({user: 'bigidiot', from: 1422748800, to: 1430438400, limit: 10});