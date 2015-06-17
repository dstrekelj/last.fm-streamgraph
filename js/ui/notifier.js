define(function() {
  
  var notifierShow = document.getElementById('notifierShow'),
      notifierHide = document.getElementById('notifierHide'),
      notifier = document.getElementById('notifier');
  
  function show(Event) {
    Event.preventDefault();
    notifier.className = 'show';
  };
  
  function hide(Event) {
    Event.preventDefault();
    notifier.className = 'hide';
  };

  notifierShow.addEventListener('click', show, false);
  notifierHide.addEventListener('click', hide, false);
  
});