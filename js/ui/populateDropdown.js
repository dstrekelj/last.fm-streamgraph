define(function() {
  
  var currentDate = new Date(Date.now()),
      monthNames  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function addOption(Parent, Text, Value) {
    var option = document.createElement('option');
    var text = document.createTextNode(Text);
    option.setAttribute('value', Value);
    // Firefox doesn't do well with `innerText`, so we append a text node
    //option.innerText = Text;
    option.appendChild(text);
    document.getElementById(Parent).appendChild(option);
  }

  for (var year = 2006; year <= currentDate.getFullYear(); year++) {
    addOption('fromY', year, year);
    addOption('toY', year, year);
  }

  for (var month = 0; month < 12; month++) {
    addOption('fromM', monthNames[month], month);
    addOption('toM', monthNames[month], month);
  }

  for (var date = 1; date <= 31; date++) {
    addOption('fromD', date, date);
    addOption('toD', date, date);
  }
  
});