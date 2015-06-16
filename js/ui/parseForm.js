define(function() {
  
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
  
  return parseForm;
  
});