// Quick-and-dirty way of populating drop down menus
(function () {
  var currentDate = new Date(Date.now()),
      monthNames  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function addOption(Parent, Text, Value) {
    var option = document.createElement('option');
    option.setAttribute('value', Value);
    option.innerText = Text;
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
}());

/**
 * Parse form data into inline object.
 * @param	form	HTML form
 * @return	Form data as inline object
 */
function parseForm (Form) {
  var formElements  = Form.elements,
      formData      = {};

  for (var i = 0; i < formElements.length; i++) {
    var element = formElements[i];
    if (element.value !== "") {
      formData[element.name] = element.value;
    }
  }

  return formData;
};

// -- APP -- //

var app = new App();

var loader = new Loader('#loader');
app.setLoadingIndicator(loader);

function onClick(Event) {
  Event.preventDefault();
  var data  = parseForm(document.forms.namedItem('parameters')),
      from  = new Date(Date.UTC(data.fromY, data.fromM, data.fromD)),
      to    = new Date(Date.UTC(data.toY, data.toM, data.toD));
  
  var params = {
    user  : data.user,
    limit : data.limit,
    from  : from.getTime() / 1000,
    to    : to.getTime() / 1000
  };
  
  app.request(params, '#graph');
}

document.getElementById('parameters').addEventListener('submit', onClick, false);
