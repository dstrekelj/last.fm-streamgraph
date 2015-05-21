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
