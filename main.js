document.getElementById('navigation').addEventListener('mouseover', function(e) {
  this.setAttribute('class', 'open');
});

document.getElementById('navigation').addEventListener('mouseout', function(e) {
  this.setAttribute('class', 'closed');
});

var app = new App();

document.getElementById('app').addEventListener('submit', function(e) {
  e.preventDefault();
  app.request({user: 'bigidiot', from: 1422748800, to: 1430438400, limit: 10});
}, false);

//app.request({user: 'bigidiot', from: 1422748800, to: 1430438400, limit: 10});